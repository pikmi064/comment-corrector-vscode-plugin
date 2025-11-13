/**
 * Расширение CommentCorrector для VS Code.
 * 
 * Это расширение автоматически анализирует, классифицирует и корректирует комментарии в коде,
 * приводя их к формальному корпоративному стилю. Поддерживает работу с различными языками
 * программирования через OpenAI-совместимое API.
 * 
 * @packageDocumentation
 */

import * as vscode from 'vscode';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import * as path from 'path';

/**
 * Промпт для коррекции комментариев к коду.
 */
let format_prompt : string = `
		Просмотри комментарий к коду. 
		
		ЕСЛИ комментарий уже соответствует всем критериям:
		- Формальный стиль и стандарты
		- Нет неформальной лексики, матов, эмоциональных оценок, разговорных выражений
		- Технически корректен и информативен
		ТО отправь его обратно БЕЗ ИЗМЕНЕНИЙ.

		ЕСЛИ комментарий НЕ соответствует критериям, ТО перепиши его:
		ТРЕБОВАНИЯ К ФОРМАТИРОВАНИЮ:
		- Сохрани исходный язык комментария
		- НЕ добавляй символов комментария

		ТРЕБОВАНИЯ К СОДЕРЖАНИЮ:
		- Приведи комментарий к стандарту
		- Сохрани техническую суть комментария
		- Удали полностью: неформальную лексику, маты, эмоциональные оценки, разговорные выражения

		ВАЖНО: Если комментарий уже хороший - НЕ МЕНЯЙ его вообще.
		Формат ответа: предоставь ТОЛЬКО финальную версию комментария, больше НИЧЕГО.
`;

/**
 * Промпт для классификации стиля комментариев.
 */
let classify_prompt : string = `
		Проанализируй комментарий к коду и определи его стиль:

		- **формальный**: профессиональный, технический, структурированный, без эмоций и сленга
		- **неформальный**: с неточностями, с эмоциями, сленгом, неструктурированный, разговорный, бесполезный

		Ответь только "формальный" или "неформальный".
`;


/**
 * Выполняет запрос к API модели для обработки комментария.
 * 
 * @internal
 * Внутренняя функция модуля, используется только внутри расширения.
 * 
 * @param client - Инициализированный клиент OpenAI-совместимого API
 * @param comment - Текст комментария, который необходимо обработать
 * @param prompt - Промпт, задающий формат и требования к ответу модели
 * @returns Текст ответа модели или пробел, если ответ отсутствует
 * @throws {Error} Если не задано имя модели в переменных окружения
 * 
 * @example
 * ```typescript
 * await Request(client, "// todo: fix", format_prompt);
 * // Возвращает исправленный комментарий
 * 
 * await Request(client, "# временно отключено", classify_prompt);
 * // Возвращает "формальный" или "неформальный"
 * ```
 */
export async function Request(client : OpenAI, comment : string, prompt : string): Promise<string>{
	if (!process.env.MODEL_NAME) {
		throw new Error("Не задано имя модели.");
	}
	let response : string = " ";
	const completion = await client.chat.completions.create({
		messages: [
			{ role: "user", content: prompt + comment}
		],
		model: process.env.MODEL_NAME
	});

	if (completion.choices[0].message.content !== null) {
		response = completion.choices[0].message.content;
	} 
	return response;
}


/**
 * Определяет стиль комментариев на основе идентификатора языка документа.
 * 
 * @internal
 * Внутренняя функция модуля, используется только внутри расширения.
 * 
 * @param language - Идентификатор языка файла в редакторе VS Code (например, "typescript", "python")
 * @returns Строка с символами комментария для данного языка или undefined, если язык не поддерживается
 * 
 * @example
 * ```typescript
 * GetCommentStyle("typescript"); // Возвращает "//"
 * GetCommentStyle("python");     // Возвращает "#"
 * ```
 */
export function GetCommentStyle(language: string): string | undefined	{
    switch (language) {
        case 'javascript':
        case 'typescript':
        case 'java':
        case 'csharp':
        case 'cpp':
            return '//';
        case 'python':
            return '#';
        case 'css':
        case 'scss':
            return '/*';
        case 'html':
            return '<!--';
        default:
            return undefined;
    }
};

/**
 * Сбрасывает все активные выделения цветом в текущем редакторе VS Code.
 * 
 * @internal
 * Внутренняя функция модуля, используется только внутри расширения.
 * 
 * @param good_comment_decoration - Декоратор для формальных комментариев
 * @param bad_comment_decoration - Декоратор для неформальных комментариев
 * @param undefined_comment_decoration - Декоратор для комментариев без результата классификации
 * 
 * @example
 * ```typescript
 * DisableHighlight(goodDecoration, badDecoration, undefinedDecoration);
 * // Удаляет все подсветки комментариев из активного редактора
 * ```
 */
export function DisableHighlight(good_comment_decoration : any,
						  bad_comment_decoration : any,
					      undefined_comment_decoration : any) : void {
	const text_editor : vscode.TextEditor | undefined = vscode.window.activeTextEditor;
	if (!text_editor) {return;}
	text_editor.setDecorations(good_comment_decoration, []);
	text_editor.setDecorations(bad_comment_decoration, []);
	text_editor.setDecorations(undefined_comment_decoration, []);
}

/**
 * Обработчик команды для коррекции комментариев в активном файле.
 * 
 * @internal
 * Внутренняя функция модуля, используется как обработчик команды VS Code.
 * 
 * Находит все комментарии в активном файле и заменяет неформальные на формальные эквиваленты
 * через API модели.
 * 
 * @param client - Инициализированный клиент OpenAI-совместимого API
 * @param good_comment_decoration - Декоратор для формальных комментариев
 * @param bad_comment_decoration - Декоратор для неформальных комментариев
 * @param undefined_comment_decoration - Декоратор для комментариев без результата классификации
 */
export async function handleCorrectComments(
	client: OpenAI,
	good_comment_decoration: vscode.TextEditorDecorationType,
	bad_comment_decoration: vscode.TextEditorDecorationType,
	undefined_comment_decoration: vscode.TextEditorDecorationType
): Promise<void> {
	vscode.window.showInformationMessage("Поиск и замена некорректных комментариев...");
	DisableHighlight(good_comment_decoration, bad_comment_decoration, undefined_comment_decoration);
	const text_editor : vscode.TextEditor | undefined = vscode.window.activeTextEditor;
	if (!text_editor) {return;}
	let comment_symb : string | undefined = GetCommentStyle(text_editor.document.languageId);
	if (!comment_symb) {return;}
	let lines : string[] = text_editor.document.getText().split("\n");
	let request_error : boolean = false;
	for (let i = 0; i < lines.length; i++) {
		let comment_symb_ind : number = lines[i].indexOf(comment_symb); 
		if (comment_symb_ind === -1) {continue;}
		try {
			let correct_comment : string = await Request(client, lines[i].slice(comment_symb_ind + comment_symb.length), 
															 	   format_prompt);
			lines[i] = lines[i].slice(0, comment_symb_ind) + comment_symb + correct_comment;
		} catch(error) {
			console.log(error);
			request_error = true;
		}
	}
	await text_editor.edit(edit => {
		const range = new vscode.Range(0, 0, text_editor.document.lineCount, 0);
		edit.replace(range, lines.join("\n"));
	});
	if (request_error) {
		vscode.window.showInformationMessage("Некоторые комментарии не удалось заменить.");
	} else {
		vscode.window.showInformationMessage("Все некорректные комменатрии заменены.");
	}
}

/**
 * Обработчик команды для выжделения цветом комментариев в активном файле.
 * 
 * @internal
 * Внутренняя функция модуля, используется как обработчик команды VS Code.
 * 
 * Классифицирует комментарии в активном файле и выделяет их цветом:
 * - Зелёный: формальные комментарии
 * - Красный: неформальные комментарии
 * - Жёлтый: комментарии с неопределённой классификацией
 * 
 * @param client - Инициализированный клиент OpenAI-совместимого API
 * @param good_comment_decoration - Декоратор для формальных комментариев
 * @param bad_comment_decoration - Декоратор для неформальных комментариев
 * @param undefined_comment_decoration - Декоратор для комментариев без результата классификации
 */
export async function handleHighlightComments(
	client: OpenAI,
	good_comment_decoration: vscode.TextEditorDecorationType,
	bad_comment_decoration: vscode.TextEditorDecorationType,
	undefined_comment_decoration: vscode.TextEditorDecorationType
): Promise<void> {
	vscode.window.showInformationMessage("Поиск комментариев...");
	const text_editor : vscode.TextEditor | undefined = vscode.window.activeTextEditor;
	if (!text_editor) {return;}
	let comment_symb : string | undefined = GetCommentStyle(text_editor.document.languageId);
	if (!comment_symb) {return;}
	let lines : string[] = text_editor.document.getText().split("\n");
	
	let good_ranges_arr = [];
	let bad_ranges_arr = [];
	let undefined_ranges_arr = [];
	
	let request_error = false;
	for (let i = 0; i < lines.length; i++) {
		let comment_symb_ind : number = lines[i].indexOf(comment_symb); 
		let end_ind : number = lines[i].length; 
		if (comment_symb_ind === -1) {continue;}

		const range = new vscode.Range(
				new vscode.Position(i, comment_symb_ind),  
				new vscode.Position(i, end_ind)  
		);
		
		try {
			let response : string = await Request(client, lines[i].slice(comment_symb_ind + comment_symb.length), 
												classify_prompt);
			if (response === "формальный") {
				good_ranges_arr.push(range);
			} else if (response === "неформальный") {
				bad_ranges_arr.push(range);
			} else {
				undefined_ranges_arr.push(range);
			}	
		} catch (error) {
			undefined_ranges_arr.push(range);
			request_error = true;
		}		
	}	

	DisableHighlight(good_comment_decoration, bad_comment_decoration, undefined_comment_decoration);
	text_editor.setDecorations(good_comment_decoration, good_ranges_arr);
	text_editor.setDecorations(bad_comment_decoration, bad_ranges_arr);
	text_editor.setDecorations(undefined_comment_decoration, undefined_ranges_arr);	

	if (request_error) {
		vscode.window.showInformationMessage("Некоторые комментарии не удалось обработать.");
	} else {
		vscode.window.showInformationMessage("Все комментарии выделены цветом.");
	}
}

/**
 * Обработчик команды для отключения подсветки комментариев.
 * 
 * @internal
 * Внутренняя функция модуля, используется как обработчик команды VS Code.
 * 
 * Удаляет все активные декорации комментариев из активного редактора.
 * 
 * @param good_comment_decoration - Декоратор для формальных комментариев
 * @param bad_comment_decoration - Декоратор для неформальных комментариев
 * @param undefined_comment_decoration - Декоратор для комментариев без результата классификации
 */
export function handleDisableHighlight(
	good_comment_decoration: vscode.TextEditorDecorationType,
	bad_comment_decoration: vscode.TextEditorDecorationType,
	undefined_comment_decoration: vscode.TextEditorDecorationType
): void {
	DisableHighlight(good_comment_decoration, bad_comment_decoration, undefined_comment_decoration);
}

/**
 * Инициализирует расширение, регистрирует команды и настраивает окружение.
 * 
 * Эта функция вызывается VS Code при активации расширения. Она:
 * - Загружает переменные окружения из файла .env
 * - Инициализирует клиент OpenAI API
 * - Создает декораторы для подсветки комментариев
 * - Регистрирует команды расширения
 * 
 * @param context - Объект контекста расширения VS Code
 * 
 * @example
 * ```typescript
 * // Вызывается автоматически VS Code при активации расширения
 * activate(context);
 * ```
 */
export function activate(context: vscode.ExtensionContext) {
	dotenv.config({ path: path.join(context.extensionPath, '.env') });

	let client : OpenAI = new OpenAI({
		baseURL: process.env.API_URL, 
		apiKey: process.env.API_KEY, 
	});

	/**
	 * Декоратор для подсветки формальных комментариев (зелёный цвет).
	 */
	const good_comment_decoration = vscode.window.createTextEditorDecorationType({
    	backgroundColor: 'rgba(76, 175, 80, 0.15)',
		border: '1px solid rgba(76, 175, 80, 0.7)',
		borderRadius: '3px',
		overviewRulerColor: '#4CAF50',
		overviewRulerLane: vscode.OverviewRulerLane.Right,
		rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
	});

	/**
	 * Декоратор для подсветки неформальных комментариев (красный цвет).
	 */
	const bad_comment_decoration = vscode.window.createTextEditorDecorationType({
		backgroundColor: 'rgba(244, 67, 54, 0.15)',
		border: '1px solid rgba(244, 67, 54, 0.7)',
		borderRadius: '3px',
		overviewRulerColor: '#F44336',
		overviewRulerLane: vscode.OverviewRulerLane.Right,
		rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
	});

	/**
	 * Декоратор для подсветки комментариев с неопределённой классификацией (жёлтый цвет).
	 */
	const undefined_comment_decoration = vscode.window.createTextEditorDecorationType({
		backgroundColor: 'rgba(255, 193, 7, 0.15)',
		border: '1px solid rgba(255, 193, 7, 0.7)',
		borderRadius: '3px',
		overviewRulerColor: '#FFC107',
		overviewRulerLane: vscode.OverviewRulerLane.Right,
		rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
	}); 

	const format_command = vscode.commands.registerCommand('commentcorrector.CorrectComments', 
		() => handleCorrectComments(client, good_comment_decoration, bad_comment_decoration, undefined_comment_decoration)
	);

	const highligh_command = vscode.commands.registerCommand('commentcorrector.HighlightComments', 
		() => handleHighlightComments(client, good_comment_decoration, bad_comment_decoration, undefined_comment_decoration)
	);

	const disable_highligh_command = vscode.commands.registerCommand('commentcorrector.DisableHighlight', 
		() => handleDisableHighlight(good_comment_decoration, bad_comment_decoration, undefined_comment_decoration)
	);		

	context.subscriptions.push(format_command, highligh_command, disable_highligh_command);

}

/**
 * Деактивирует расширение, освобождая ресурсы.
 * 
 * @example
 * ```typescript
 * // Вызывается автоматически VS Code при деактивации расширения
 * deactivate();
 * ```
 */
export function deactivate() {
}

[**CommentCorrector v0.0.1**](../README.md)

***

[CommentCorrector](../globals.md) / handleHighlightComments

# Function: handleHighlightComments()

> **handleHighlightComments**(`client`, `good_comment_decoration`, `bad_comment_decoration`, `undefined_comment_decoration`): `Promise`\<`void`\>

Defined in: extension.ts:223

**`Internal`**

Обработчик команды для выжделения цветом комментариев в активном файле.

Внутренняя функция модуля, используется как обработчик команды VS Code.

Классифицирует комментарии в активном файле и выделяет их цветом:
- Зелёный: формальные комментарии
- Красный: неформальные комментарии
- Жёлтый: комментарии с неопределённой классификацией

## Parameters

### client

`OpenAI`

Инициализированный клиент OpenAI-совместимого API

### good\_comment\_decoration

`TextEditorDecorationType`

Декоратор для формальных комментариев

### bad\_comment\_decoration

`TextEditorDecorationType`

Декоратор для неформальных комментариев

### undefined\_comment\_decoration

`TextEditorDecorationType`

Декоратор для комментариев без результата классификации

## Returns

`Promise`\<`void`\>

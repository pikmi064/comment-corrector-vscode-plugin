[**CommentCorrector v0.0.1**](../README.md)

***

[CommentCorrector](../globals.md) / handleCorrectComments

# Function: handleCorrectComments()

> **handleCorrectComments**(`client`, `good_comment_decoration`, `bad_comment_decoration`, `undefined_comment_decoration`): `Promise`\<`void`\>

Defined in: extension.ts:170

**`Internal`**

Обработчик команды для коррекции комментариев в активном файле.

Внутренняя функция модуля, используется как обработчик команды VS Code.

Находит все комментарии в активном файле и заменяет неформальные на формальные эквиваленты
через API модели.

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

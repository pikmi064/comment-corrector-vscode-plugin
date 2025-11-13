[**CommentCorrector v0.0.1**](../README.md)

***

[CommentCorrector](../globals.md) / handleDisableHighlight

# Function: handleDisableHighlight()

> **handleDisableHighlight**(`good_comment_decoration`, `bad_comment_decoration`, `undefined_comment_decoration`): `void`

Defined in: extension.ts:291

**`Internal`**

Обработчик команды для отключения подсветки комментариев.

Внутренняя функция модуля, используется как обработчик команды VS Code.

Удаляет все активные декорации комментариев из активного редактора.

## Parameters

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

`void`

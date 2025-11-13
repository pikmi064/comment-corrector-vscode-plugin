[**CommentCorrector v0.0.1**](../README.md)

***

[CommentCorrector](../globals.md) / DisableHighlight

# Function: DisableHighlight()

> **DisableHighlight**(`good_comment_decoration`, `bad_comment_decoration`, `undefined_comment_decoration`): `void`

Defined in: extension.ts:146

**`Internal`**

Сбрасывает все активные выделения цветом в текущем редакторе VS Code.

Внутренняя функция модуля, используется только внутри расширения.

## Parameters

### good\_comment\_decoration

`any`

Декоратор для формальных комментариев

### bad\_comment\_decoration

`any`

Декоратор для неформальных комментариев

### undefined\_comment\_decoration

`any`

Декоратор для комментариев без результата классификации

## Returns

`void`

## Example

```typescript
DisableHighlight(goodDecoration, badDecoration, undefinedDecoration);
// Удаляет все подсветки комментариев из активного редактора
```

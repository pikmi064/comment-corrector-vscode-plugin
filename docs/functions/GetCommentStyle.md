[**CommentCorrector v0.0.1**](../README.md)

***

[CommentCorrector](../globals.md) / GetCommentStyle

# Function: GetCommentStyle()

> **GetCommentStyle**(`language`): `string` \| `undefined`

Defined in: extension.ts:110

**`Internal`**

Определяет стиль комментариев на основе идентификатора языка документа.

Внутренняя функция модуля, используется только внутри расширения.

## Parameters

### language

`string`

Идентификатор языка файла в редакторе VS Code (например, "typescript", "python")

## Returns

`string` \| `undefined`

Строка с символами комментария для данного языка или undefined, если язык не поддерживается

## Example

```typescript
GetCommentStyle("typescript"); // Возвращает "//"
GetCommentStyle("python");     // Возвращает "#"
```

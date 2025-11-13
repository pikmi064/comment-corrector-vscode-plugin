[**CommentCorrector v0.0.1**](../README.md)

***

[CommentCorrector](../globals.md) / Request

# Function: Request()

> **Request**(`client`, `comment`, `prompt`): `Promise`\<`string`\>

Defined in: extension.ts:76

**`Internal`**

Выполняет запрос к API модели для обработки комментария.

Внутренняя функция модуля, используется только внутри расширения.

## Parameters

### client

`OpenAI`

Инициализированный клиент OpenAI-совместимого API

### comment

`string`

Текст комментария, который необходимо обработать

### prompt

`string`

Промпт, задающий формат и требования к ответу модели

## Returns

`Promise`\<`string`\>

Текст ответа модели или пробел, если ответ отсутствует

## Throws

Если не задано имя модели в переменных окружения

## Example

```typescript
await Request(client, "// todo: fix", format_prompt);
// Возвращает исправленный комментарий

await Request(client, "# временно отключено", classify_prompt);
// Возвращает "формальный" или "неформальный"
```

[**CommentCorrector v0.0.1**](../README.md)

***

[CommentCorrector](../globals.md) / activate

# Function: activate()

> **activate**(`context`): `void`

Defined in: extension.ts:316

Инициализирует расширение, регистрирует команды и настраивает окружение.

Эта функция вызывается VS Code при активации расширения. Она:
- Загружает переменные окружения из файла .env
- Инициализирует клиент OpenAI API
- Создает декораторы для подсветки комментариев
- Регистрирует команды расширения

## Parameters

### context

`ExtensionContext`

Объект контекста расширения VS Code

## Returns

`void`

## Example

```typescript
// Вызывается автоматически VS Code при активации расширения
activate(context);
```

# PWA icons in this repository

## Текущая схема
- Основная иконка для установки приложения: `logo.png`.
- Fallback-иконка (текстовый формат): `logo.svg`.
- `index.html` и `main.html` подключают обе иконки (`logo.png` + `logo.svg` fallback).
- `manifest.json` содержит две записи: сначала `logo.png`, затем `logo.svg` fallback.

## Важно для PR
Если PR-система отклоняет бинарные файлы, не коммитьте PNG в этот репозиторий:
- оставляйте `logo.svg` как fallback;
- `logo.png` публикуйте во внешнем static/CDN и указывайте абсолютный URL в `manifest.json` и `<link>`.

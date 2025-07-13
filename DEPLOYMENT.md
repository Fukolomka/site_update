# Развертывание на hitmanki.store

## 1. Подготовка переменных окружения

Отредактируйте файл `.env.local` и заполните реальные значения:

```bash
# Основные настройки
NEXTAUTH_URL=https://hitmanki.store
NEXTAUTH_SECRET=your-very-secure-secret-key-here

# Steam OpenID настройки
STEAM_RETURN_URL=https://hitmanki.store/api/auth/steam/return
STEAM_API_KEY=your-steam-api-key-here

# JWT секрет
JWT_SECRET=your-very-secure-jwt-secret-here

# База данных
DATABASE_URL="mysql://username:password@host:port/database"

# Админы (Steam ID через запятую)
ADMIN_STEAM_IDS=76561199446613665
```

## 2. Настройка Steam OpenID

1. Зайдите в Steam Developer Console
2. Добавьте домен `https://hitmanki.store` в разрешенные домены
3. Укажите return URL: `https://hitmanki.store/api/auth/steam/return`

## 3. Сборка и запуск

```bash
# Установка зависимостей
npm install

# Генерация Prisma клиента
npm run db:generate

# Сборка для продакшена
npm run build

# Запуск в продакшене
npm run start:prod
```

## 4. Настройка веб-сервера (Nginx)

Создайте конфигурацию Nginx:

```nginx
server {
    listen 80;
    server_name hitmanki.store;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name hitmanki.store;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 5. Настройка SSL сертификата

Используйте Let's Encrypt для бесплатного SSL:

```bash
sudo certbot --nginx -d hitmanki.store
```

## 6. Настройка PM2 (опционально)

Для управления процессом:

```bash
# Установка PM2
npm install -g pm2

# Запуск приложения
pm2 start npm --name "hitmanki" -- run start:prod

# Автозапуск при перезагрузке
pm2 startup
pm2 save
```

## 7. Проверка

После развертывания проверьте:

1. Сайт доступен по HTTPS: `https://hitmanki.store`
2. Steam авторизация работает
3. API endpoints отвечают корректно
4. Cookie устанавливаются для домена `.hitmanki.store`

## 8. Мониторинг

Настройте логирование и мониторинг:

```bash
# Просмотр логов
pm2 logs hitmanki

# Мониторинг процессов
pm2 monit
```
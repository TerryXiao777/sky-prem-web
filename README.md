This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prisma

```
npm install prisma @types/pg --save-dev
npm install @prisma/client @prisma/adapter-pg pg dotenv

npx prisma migrate dev --name init (生成数据库脚本)
npx prisma generate
```



## Neon
```
npm install @neondatabase/auth@latest

```

## Neon Cookie Secret
```
openssl rand -base64 32(如果没有安装，也可以使用NodeJs生成)

```

### shadcn
```
npx shadcn@latest init

npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add textarea
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add form
```
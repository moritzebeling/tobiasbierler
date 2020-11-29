# Tobias Bierler
Portfolio website for architect Tobias Bierler

## Installation
To work on this project, you will need:
- A GitHub Account
- [Git](https://sourceforge.net/projects/git-osx-installer/) on your machine (type `git -v` to check if you have it already)
- [PHP][https://php-osx.liip.ch] on your local machine and server (type `php -v` to check if you have it already)
- [Node.js](https://nodejs.org/en/) on your machine (type `node -v` to check if you already have it)

## Development
Run local PHP server
```
php -S localhost:8000
```

Run Svelte development
```
cd theme
npm run dev
```

## Content
Build your page structure inside the `portfolio` directory, eg:
```
portfolio
  - project-1
    data.json
    image-1.jpg
    image-2.jpg
  - project-2
    data.json
    image-3.jpg
```
Inside the `data.json` you can give a title and some metadata to your page, eg:
```json
{
    "title": "My page",
    "year": 2019,
}
```

All images will be thumbnailed to a `temporary` directory, that can be removed any time to rebuild all thumbs, which can take a while.

## Deployment

Compile Svelte frontend for deployment
```
npm run build
```

Copy everything to your remote PHP webhost. For just content updates, you will just have to sync the `portfolio` directory.

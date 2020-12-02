# Tobias Bierler
Portfolio website for architect Tobias Bierler

## Installation
To work on this project, you will need:
- The Terminal to execute commands
- [PHP](https://php-osx.liip.ch) to serve the website or test-run it on your local machine (type `php -v` to check if you have it already).
- [Node.js + NPM](https://nodejs.org/en/) if you want to make changes to the design and layout of the page (type `node -v` to check if you already have it).

If you also want to contribute to this project and get all latest updates, you will need:
- A GitHub Account
- [Git](https://sourceforge.net/projects/git-osx-installer/) on your machine (type `git -v` to check if you have it already)

Somewhere on your machine, create a working directory for your website projects, eg `my-websites`.
Open the Terminal and type `cd ` and drag your working directory from the Finder onto the Temrinal window. It should look like `cd Users/{yourname}/{yourpath}/my-websites`.

Type
```
git clone git@github.com:moritzebeling/tobiasbierler.git
cd tobiasbierler
```
to get a clone of the code and navigate inside that project folder.

## Development
Run local PHP server
```
php -S localhost:8000
```

Run Svelte development via npm
```
cd theme
npm install
npm run dev
```

## Content
Build your page structure inside the `content` directory, eg:
```
content
  portfolio
    data.json
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

## Media
All images will be thumbnailed to a `temporary` directory, that can be removed any time to rebuild all thumbs, which will take up to a minute. The image sizes are `600`, `1200`, `2000` px wide.

## Deployment

Compile Svelte frontend for deployment
```
npm run build
```

Copy everything to your remote PHP webhost, including the hidden `.htaccess` file. For just content updates, you will just have to sync the `portfolio` directory.

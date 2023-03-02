# Notion to Hugo Blog

This is a Node.js script + Hugo Blog that converts a Notion Database into a Hugo blog for static-hosting.

## Required Packages

These are the packages need to use this repo, They will be automatically setup in docker.

-   Node

    You need the node runtime in order to run the download script. I recommend using [nvm.sh](https://github.com/nvm-sh/nvm/blob/master/README.md#installing-and-updating) to download and install node js on Linux/Unix. It should be just three commands below

    ```bash
    wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
    # Restart your shell or source your .zshrc or .bashrc directly
    nvm install --lts
    nvm use --lts
    ```

-   Hugo

    [Hugo](https://gohugo.io) is a static-site generator written in Go and is infamous for using Go Templating Syntax. You can easily install it using your package manger, through git or the click and drag installation with your GUI OR Refer to the [Official Installation Instructions](https://gohugo.io/installation/).

## Configuration

1. Setup the following environment variables in a .env file, in your shell using `export VAR=VALUE` or directly in the Dockerfile(DO NOT commit a docker file with secrets to git).

    ```bash
    NOTION_KEY=<your-notion-api-key>
    NOTION_DATABASE_ID=<your-blogs-database-id>
    ```

2. ~~Set base URL for your site in `hugo-site/config.toml` and `package.json:script/build:docker`, it should be the domain name where the site will be exposed/hosted.~~ Setting baseURL is not neccessary as all files are Relatively linked instead of Permalink.

3. If using docker compose, set the external port to what you desire. The default is port `8000`.

## Instructions

### Docker

Using this project in docker is simple, just set your environment variables in Dockerfile or .env file and run the below commands.

```bash
docker build -t notion-hugo-blog -f ./Dockerfile
docker run -p 8000:80 notion-hugo-blog
```

Or using `docker compose`

```bash
docker compose up -d
```

### Bare Metal

1. Install all the node js dependencies, using `yarn install` or `make node_deps`

2. Download the latest version of blogs from notion, It will overwrite older blogs and download all blogs from the database. It may take some time.

    ```bash
    yarn download
    ```

3. To build the Static Site, run:

    ```bash
    yarn build
    ```

    A static-site directory will appear at the top level and this folder can be hosted using `nginx` or any other static site server.

4. To serve the markdown files with hot reload for testing or editing, run:
    ```bash
    yarn serve
    ```

#### Deployment

There is a Makefile for easier and automated deployment and updating the blog.

On first run, use:

```bash
make clean build
```

Optionally If you want to deploy on nginx on an EC2 instance, run:

```bash
make prepare
```

This command permits write access to nginx static files directory, where you can copy build files on subsequent automated builds without root access. You can skip this step if you can run a cronjob as root.

Finally, to deploy to nginx, run:

```bash
make deploy_nginx
```

All the above steps can be run with one command as `make` after explicit write access to `/usr/share/nginx/html`

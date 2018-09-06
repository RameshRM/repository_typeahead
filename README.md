# repository_typeahead

Trie Search of Git Public Repositories

## Installation

### Docker Image;

```bash
  docker pull ramesh1211/git_repos_typeahead:7f826c334b67
```

> Container don't follow **Latest** Tag rather follows the convention of _LastCommitId_

### Usage

```
  docker run -d -p 8080:8080 98d61237ed97
```

> Port Exposed is 8080.

### W/o Docker

```
  https://github.com/RameshRM/repository_typeahead.git

  cd repository_typeahead
  npm i

  npm start
```

> Server Runs on Port 8080

## Details

Summary of implementation.

1. Entry point is `index.js` at the root directory.

  - Build the Data Set with Github api

  - Download the Repos JSON from https://api.github.com/repositories

  - Build a https://en.wikipedia.org/wiki/Trie , AutoComplete | Typeahead matches with `Trie`

2. **Http  Express** Server is connected with the Web

    - Server Starts on port 8080

    - Exposes Search API to return JSON payload


## Routes

  `/`: Home Page or Landing Page, which exposes a SearchBox

  `/:name`: Detail Page of the Repository

  `/search/?keywords=c`: Search API with keywords

## Run Test

  Makefile runs the test along with Liniting & Code Coverage.

## Environment Variables:

```
ENV GIT_REPOS_API='https://api.github.com/repositories'
ENV GET_REPO_API='https://api.github.com/repos'
ENV DATASET_PATH=$(pwd)/.dataset
ENV DEBUG=typeahead
```

## Todo

[x] Build a Searchable AutoComplete

[x] Show Name & Avatar in the search results.

[x] Clickable results

[x] Repository Detail pages

  [x] Details of the Repository

  [x] Contributions

[x] Back button.
    Stateful app and Browsers Back button is working fine.

[x] Tests

  `make all` - Runs liniting, test & code coverage.

FROM node:6
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app

RUN npm config set registry https://registry.npmjs.org

RUN npm cache clean

RUN npm install

COPY . /usr/src/app

EXPOSE 8080

ENV GIT_REPOS_API='https://api.github.com/repositories'
ENV GET_REPO_API='https://api.github.com/repos'
ENV DATASET_PATH=$(pwd)/.dataset
ENV DEBUG=typeahead

CMD [ "npm", "start" ]

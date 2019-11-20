#!/bin/sh

if [ -n "${APP_CNAME}" ]; then
  echo "${APP_CNAME}" > public/CNAME
fi

npm run doBuild

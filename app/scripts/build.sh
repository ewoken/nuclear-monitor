#!/bin/sh

if [ -n "${APP_CNAME}" ]; then
  echo "${APP_CNAME}" > public/CNAME
fi

if [ -n "${APP_HOMEPAGE}" ]; then
  node scripts/updatePackage.js
fi

npm run doBuild

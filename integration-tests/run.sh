#!/bin/bash

# install it (via local link)
npm i
npm link ../.

# get help
npx serverless oncall --help

# assumes PD_API_KEY env var
npx serverless oncall sync
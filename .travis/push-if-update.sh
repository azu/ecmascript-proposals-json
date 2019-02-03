#! /usr/bin/env bash

set -eu

usage_exit() {
    echo "Usage: $0 [-m msg] target_files ..." 1>&2
    exit 1
}

if [[ ${TRAVIS:-} = "true" ]] ; then
    TRAVIS_BUILD_URL=https://travis-ci.org/$TRAVIS_REPO_SLUG/builds/$TRAVIS_BUILD_ID
    GIT_COMMIT_MESSAGE="Update data by the cron job $TRAVIS_BUILD_URL"
else
    GIT_COMMIT_MESSAGE="Update data"
fi

while getopts m:h OPT
do
    case $OPT in
        m)  GIT_COMMIT_MESSAGE=$OPTARG
            ;;
        h)  usage_exit
            ;;
        \?) usage_exit
            ;;
    esac
done

shift $((OPTIND - 1))

if [[ $# -le 0 ]] ; then
    usage_exit
fi

if [[ -z "$(git diff --name-only $@)" ]] ; then
    echo "File unchanged. Do nothing."
else
    git add "$@"
    git commit -m "$GIT_COMMIT_MESSAGE"
    git push origin master
fi

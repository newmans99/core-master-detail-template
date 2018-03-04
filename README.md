# core-md-template
This repository contains a template to build a Master/Detail example application for use with Qlik Core

Note that before you deploy, you will need to have an update to date and licensed version of Qlik Core. During the beta, you must accept the [Qlik Core EULA](https://ca.qliktive.com/docs/master/beta/) by setting the `ACCEPT_EULA` environment variable.

```sh
$ ACCEPT_EULA=yes docker-compose up -d
```

## Contents

- [md-template](./src/md-template/) - Template source code
- [test](./test) - Function tests for the examples (bash scripts)
- [data](./data) - The Movies data, used as user data in the default example

## Contributing

I welcome and encourage contributions!

## Found a bug?

Found a problem with the examples? Don't hesitate to submit an issue.

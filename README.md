# bjc-r-ita [EDC][edc] | [Berkeley][berkeley]

[The Beauty and Joy of Computing](https://bjc.berkeley.edu) curriculum repository.

## Cloning this Repo

All content for BJC Labs lives inside this repository.

```sh
git clone git@github.com:bjc-edc/bjc-r-ita
```

## The Awkward Forking History:

There are _two_ primary `bjc-r-ita` repositories.

- This repo ([`bjc-edc/bjc-r-ita`][edc-gh]) contains the high school AP CSP course, Middle School, and spanish translations of curricula
- [`cs10/bjc-r-ita`][cs10-gh] is ued primary for CS10 at UC Berkeley. [https://cs10.org/bjc-r-ita][cs10]
- [`beautyjoy/bjc-r-ita`][bjc-gh] is a mirror of this (bjc-edc/bjc-r-ita) repository, just for hosting.

[edc-gh]: https://github.com/bjc-edc/bjc-r-ita/
[cs10-gh]: https://github.com/cs10/bjc-r-ita/
[bjc-gh]: https://github.com/beautyjoy/bjc-r-ita/

## Viewing the Site

The public content is viewable at the following two locations:

- [https://bjc.berkeley.edu/bjc-r-ita][berkeley]
- [https://bjc.edc.org/bjc-r-ita][edc]

However, the repository is setup so that any fork can be run using GitHub pages.
The main BJC repo can be viewed in a live state, [here](gh), or you can use your own fork by visiting the following url: `http://[username].github.io/bjc-r-ita/`, where you replace `[username]` with your GitHub account name.

## Running Your Own (Local) Server

While GitHub pages are convenient, you'll likely want to run your own web server
to make viewing changes much more quick and easy. In order to view the labs, you'll need to have an Apache server running on your machine. Here are some simple instructions for a couple different platforms.

**No matter the platform, you should server files from `/bjc-r-ita/` at the root of your server.**

### macOS and Unix

The easiest way to setup a server is to use a simple, built-in Python server.

1. `cd bjc-r-ita` -- Ensure your current directory is at the root of `bjc-r-ita/`
2. Execute `./run-server`
   2.1 This **must** be run from within bjc-r-ita.
   2.2 Press Control-C to end the server.
3. Navigate to [http://localhost:8000/bjc-r-ita][localhost] in a browser.
4. That's it! :)

This server requires Python 3.

### Windows

As long as you can install Python 3, you should be able to run the same script, either via PowerShell, or WSL, or some other means.

## Contributing

### [Review the Contributing and Authorship Guide][contributing].

However, for the most part, all you need to do is write some HTML.
To contribute:

1. Create your own fork of `bjc-r-ita`.
2. Create a new branch for your feature.
3. Work away!
4. Create a pull request.
5. Get feedback on the pull request and make changes as needed.
6. Be super awesome! :)

Of course, submitting issues is always welcome and encouraged! These issues can be bugs, questions, improvements or anything you'd like to share.

## Index and Summary Pages

See `utilties/build-tools/README.md` for information on how to build the index and summary pages.

```sh
ruby utilities/build-tools/rebuild-all.rb
```

## UC Berkeley Deployment Process

@beautyjoy/bjc-r-ita serves bjc.berkeley.edu/bjc-r-ita from the `main` branch.

## License

[CC-BY-NC-SA 3.0][cc]

![CC_IMG][cc_img]

<!-- Links for the doc -->

[contributing]: docs/README.md
[cc]: https://creativecommons.org/licenses/by-nc-sa/3.0/
[cc_img]: https://i.creativecommons.org/l/by-nc-sa/3.0/88x31.png
[cs10]: https://cs10.org/bjc-r-ita
[localhost]: http://localhost:8000/bjc-r-ita
[berkeley]: https://bjc.berkeley.edu/bjc-r-ita/
[edc]: https://bjc.edc.org/bjc-r-ita

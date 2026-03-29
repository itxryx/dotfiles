# dotfiles

itxryx's dotfiles

## Setup

### Step 1: Xcode Command Line Tools

```sh
$ xcode-select --install
```

### Step 2: Homebrew

```sh
$ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
$ eval "$(/opt/homebrew/bin/brew shellenv)"
```

### Step 3: chezmoi

```sh
$ brew install chezmoi
```

### Step 4: deploy dotfiles

```sh
$ chezmoi init --apply git@github.com:itxryx/dotfiles.git
```

### Step 5: install Homebrew packages

```sh
$ brew bundle --file=~/.Brewfile
```

### Step 6: install zsh plugins

```sh
$ sheldon lock
```

### Step 7: install Node.js

```sh
$ mise use --global node@lts
```

### Step 8: restart shell

```sh
$ exec zsh -l
```

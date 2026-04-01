typeset -U path  # Remove duplicates

path=(
  $HOME/.local/bin
  $HOME/bin
  $HOME/go/bin
  /opt/homebrew/bin
  $path
)

export PATH

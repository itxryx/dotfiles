# Delete all local branches already merged into the current branch
git-delete-merged-branch() {
  git branch --merged \
    | sed 's/^[* ]*//' \
    | grep -vE '^(main|master|develop|staging|production|stg|prod)$' \
    | xargs -r git branch -d
}

# Fuzzy directory jump (max depth 3, excludes .git)
fzcd() {
  local dir
  dir=$(fd --type d --hidden --follow --exclude .git --max-depth 3 2> /dev/null | fzf +m --preview 'eza -al --color=always {}') &&
  cd "$dir"
}

# Fuzzy file preview and open with bat
fzbat() {
  local file
  file=$(fd --type f --hidden --follow --exclude .git --max-depth 3 | fzf --preview 'bat --style=numbers --color=always {}') &&
  bat "$file"
}

# Fuzzy process killer (default signal: 9)
fzkill() {
  local pid
  procs | sed 1d | fzf -m --preview-window=hidden | awk '{print $1}' | xargs kill -${1:-9}
}

# Fuzzy command history search (places selected command on the edit line)
fzhistory() {
  print -z $( ([ -n "$ZSH_NAME" ] && fc -l 1 || history) | fzf +s --tac | sed -E 's/ *[0-9]*\*? *//' | sed -E 's/\\/\\\\/g')
}

# Fuzzy environment variable browser
fzenv() {
  printenv | fzf --preview 'echo {}' --preview-window=down:3:wrap
}

# Fuzzy SSH host selector from ~/.ssh/config (excludes wildcard entries)
fzssh() {
  local host
  host=$(grep "^Host " ~/.ssh/config 2>/dev/null | grep -v "[*?]" | cut -d " " -f 2- | fzf) &&
  ssh "$host"
}

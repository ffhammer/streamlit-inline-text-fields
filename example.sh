( find . -maxdepth 1 -type f -print; find fill_in_blanks_component -type f;  ) | while read file; do
    echo "==== $file ===="
    cat "$file"
    echo
done | pbcopy

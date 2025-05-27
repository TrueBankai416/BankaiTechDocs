#!/bin/bash

echo "Files missing last_update author frontmatter:"
echo "=============================================="

missing_files=""
count=0

while IFS= read -r file; do
    if ! grep -q "last_update:" "$file" || ! grep -q "author: BankaiTech" "$file"; then
        echo "$file"
        missing_files="$missing_files$file\n"
        ((count++))
    fi
done < all_docs.txt

echo ""
echo "Total files missing frontmatter: $count"

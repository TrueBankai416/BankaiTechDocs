#!/bin/bash

# Nginx Domain Replace Script
# This script replaces domain names in nginx configuration files
# Usage: ./domain-replace-script.sh [source_domain] [target_domain] [file_pattern]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display usage
usage() {
    echo -e "${BLUE}Nginx Domain Replace Script${NC}"
    echo ""
    echo "Usage: $0 [source_domain] [target_domain] [file_pattern]"
    echo ""
    echo "Arguments:"
    echo "  source_domain   - Domain to replace (e.g., 'mydomain.com')"
    echo "  target_domain   - Replacement domain (default: 'bankai-tech.com')"
    echo "  file_pattern    - File pattern to search (default: '*.conf')"
    echo ""
    echo "Examples:"
    echo "  $0 mydomain.com bankai-tech.com '*.conf'"
    echo "  $0 example.org bankai-tech.com '*.nginx'"
    echo "  $0 test.local                    # Uses default target and pattern"
    echo ""
    echo "The script will:"
    echo "  1. Create backups of original files (.backup extension)"
    echo "  2. Replace all occurrences of source_domain with target_domain"
    echo "  3. Show a summary of changes made"
    exit 1
}

# Check if help is requested
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    usage
fi

# Set defaults
SOURCE_DOMAIN="${1}"
TARGET_DOMAIN="${2:-bankai-tech.com}"
FILE_PATTERN="${3:-*.conf}"

# Validate input
if [[ -z "$SOURCE_DOMAIN" ]]; then
    echo -e "${RED}Error: Source domain is required${NC}"
    echo ""
    usage
fi

echo -e "${BLUE}=== Nginx Domain Replace Script ===${NC}"
echo -e "Source domain: ${YELLOW}$SOURCE_DOMAIN${NC}"
echo -e "Target domain: ${GREEN}$TARGET_DOMAIN${NC}"
echo -e "File pattern:  ${BLUE}$FILE_PATTERN${NC}"
echo ""

# Find files matching the pattern
echo -e "${BLUE}Searching for files...${NC}"
FILES=($(find . -name "$FILE_PATTERN" -type f))

if [[ ${#FILES[@]} -eq 0 ]]; then
    echo -e "${RED}No files found matching pattern: $FILE_PATTERN${NC}"
    exit 1
fi

echo -e "Found ${GREEN}${#FILES[@]}${NC} files:"
for file in "${FILES[@]}"; do
    echo "  - $file"
done
echo ""

# Ask for confirmation
read -p "Do you want to proceed with the replacement? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Operation cancelled${NC}"
    exit 0
fi

# Process files
echo -e "${BLUE}Processing files...${NC}"
TOTAL_REPLACEMENTS=0
PROCESSED_FILES=0

for file in "${FILES[@]}"; do
    # Check if file contains the source domain
    if grep -q "$SOURCE_DOMAIN" "$file"; then
        # Create backup
        cp "$file" "$file.backup"
        
        # Count occurrences before replacement
        OCCURRENCES=$(grep -o "$SOURCE_DOMAIN" "$file" | wc -l)
        
        # Perform replacement
        sed -i.tmp "s/$SOURCE_DOMAIN/$TARGET_DOMAIN/g" "$file"
        rm "$file.tmp"
        
        echo -e "  ${GREEN}✓${NC} $file (${OCCURRENCES} replacements)"
        TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + OCCURRENCES))
        PROCESSED_FILES=$((PROCESSED_FILES + 1))
    else
        echo -e "  ${YELLOW}-${NC} $file (no matches)"
    fi
done

echo ""
echo -e "${GREEN}=== Summary ===${NC}"
echo -e "Files processed: ${GREEN}$PROCESSED_FILES${NC} / ${#FILES[@]}"
echo -e "Total replacements: ${GREEN}$TOTAL_REPLACEMENTS${NC}"
echo -e "Backup files created: ${BLUE}*.backup${NC}"
echo ""

if [[ $PROCESSED_FILES -gt 0 ]]; then
    echo -e "${GREEN}✓ Domain replacement completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Review the modified files to ensure they look correct"
    echo "2. Test the configurations if needed"
    echo "3. Remove backup files when satisfied: rm *.backup"
else
    echo -e "${YELLOW}No files were modified (no domain matches found)${NC}"
fi

# Additional cleanup function
echo ""
echo "Additional commands you might need:"
echo -e "${BLUE}# Remove all backup files:${NC}"
echo "find . -name '*.backup' -delete"
echo ""
echo -e "${BLUE}# Restore all files from backup:${NC}"
echo "for f in *.backup; do mv \"\$f\" \"\${f%.backup}\"; done"

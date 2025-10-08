#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 제목 추출 함수 (첫 번째 # 헤딩에서)
function extractTitle(content) {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1] : 'Apps SDK Documentation';
}

// Front matter가 이미 있는지 확인
function hasFrontMatter(content) {
    return content.startsWith('---\n');
}

// Front matter 생성
function createFrontMatter(filePath, content) {
    const isKorean = filePath.endsWith('.ko.md');
    const title = extractTitle(content);
    const lang = isKorean ? 'ko' : 'en';

    return `---
layout: default
title: ${title}
lang: ${lang}
---

`;
}

// 디렉토리를 재귀적으로 탐색
function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // 제외할 디렉토리
            if (['.git', '.claude', 'node_modules', '_layouts', '_site', '.github'].includes(file)) {
                return;
            }
            processDirectory(filePath);
        } else if (file.endsWith('.md')) {
            // 제외할 파일
            if (['DEPLOY.md', 'add-frontmatter.js'].includes(file)) {
                return;
            }

            processMarkdownFile(filePath);
        }
    });
}

// 마크다운 파일 처리
function processMarkdownFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');

    // 이미 front matter가 있으면 스킵
    if (hasFrontMatter(content)) {
        console.log(`✓ Skipped (already has front matter): ${filePath}`);
        return;
    }

    // Front matter 추가
    const frontMatter = createFrontMatter(filePath, content);
    const newContent = frontMatter + content;

    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`✓ Added front matter to: ${filePath}`);
}

// 메인 실행
const rootDir = __dirname;
console.log('Adding front matter to markdown files...\n');
processDirectory(rootDir);
console.log('\n✨ Done!');

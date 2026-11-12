#!/usr/bin/env python3
"""Validate content against AGENTS.md; no third-party packages required."""
from __future__ import annotations

import datetime as dt
import json
import re
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
SOURCE = BASE / 'data' / 'notes.json'
CATEGORIES = {'hci', 'ai', 'research'}
ALLOWED = {'id', 'title', 'category', 'summary', 'tags', 'published', 'readingMinutes', 'featured', 'sections'}


def fail(errors: list[str], where: str, message: str) -> None:
    errors.append(f'{where}: {message}')


def text_between(value: object, low: int, high: int) -> bool:
    return isinstance(value, str) and low <= len(value.strip()) <= high


def validate() -> int:
    errors: list[str] = []
    try:
        notes = json.loads(SOURCE.read_text(encoding='utf-8'))
    except (OSError, json.JSONDecodeError) as exc:
        print(f'❌ notes.json 無法讀取或格式錯誤：{exc}')
        return 1
    if not isinstance(notes, list) or not notes:
        print('❌ notes.json 必須是至少包含一篇筆記的 JSON 陣列。')
        return 1

    ids: set[str] = set()
    for i, note in enumerate(notes, 1):
        p = f'第 {i} 筆'
        if not isinstance(note, dict):
            fail(errors, p, '內容必須是 JSON 物件')
            continue
        missing = ALLOWED.difference(note)
        extra = set(note).difference(ALLOWED)
        if missing:
            fail(errors, p, f'缺少欄位 {sorted(missing)}')
        if extra:
            fail(errors, p, f'不支援的欄位 {sorted(extra)}')

        id_ = note.get('id')
        cat = note.get('category')
        if not isinstance(cat, str) or cat not in CATEGORIES:
            fail(errors, p, 'category 僅接受 hci / ai / research')
        if not isinstance(id_, str) or not re.fullmatch(r'[a-z][a-z0-9]*(?:-[a-z0-9]+)+', id_):
            fail(errors, p, 'id 必須符合小寫 kebab-case')
        elif id_ in ids:
            fail(errors, p, f'重複 id：{id_}')
        else:
            ids.add(id_)
            if isinstance(cat, str) and not id_.startswith(cat + '-'):
                fail(errors, p, f'id 應以 {cat}- 開頭')
        if not text_between(note.get('title'), 8, 40):
            fail(errors, p, 'title 長度必須介於 8–40 字')
        if not text_between(note.get('summary'), 20, 100):
            fail(errors, p, 'summary 長度必須介於 20–100 字')

        tags = note.get('tags')
        if not isinstance(tags, list) or not (1 <= len(tags) <= 5) or not all(isinstance(t, str) and t.strip() for t in tags):
            fail(errors, p, 'tags 必須是 1–5 個非空字串')
        elif len(tags) != len(set(tags)):
            fail(errors, p, 'tags 不得重複')

        published = note.get('published')
        if not isinstance(published, str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', published):
            fail(errors, p, 'published 必須是 YYYY-MM-DD')
        else:
            try:
                dt.date.fromisoformat(published)
            except ValueError:
                fail(errors, p, 'published 不是有效日期')
        reading = note.get('readingMinutes')
        if type(reading) is not int or not 1 <= reading <= 30:
            fail(errors, p, 'readingMinutes 必須為 1–30 的整數')
        if type(note.get('featured')) is not bool:
            fail(errors, p, 'featured 必須是 true / false')

        sections = note.get('sections')
        if not isinstance(sections, list) or len(sections) < 2:
            fail(errors, p, 'sections 至少需要 2 個章節')
            continue
        for j, section in enumerate(sections, 1):
            sp = f'{p} 第 {j} 章'
            if not isinstance(section, dict):
                fail(errors, sp, '章節必須是物件')
                continue
            if not isinstance(section.get('heading'), str) or not section['heading'].strip():
                fail(errors, sp, 'heading 不能是空白')
            paragraphs = section.get('paragraphs')
            if not isinstance(paragraphs, list) or not paragraphs or not all(isinstance(x, str) and x.strip() for x in paragraphs):
                fail(errors, sp, 'paragraphs 至少需要一段非空字串')
            bullets = section.get('bullets', [])
            if not isinstance(bullets, list) or not all(isinstance(x, str) and x.strip() for x in bullets):
                fail(errors, sp, 'bullets 必須是非空字串的陣列')
            if set(section) - {'heading', 'paragraphs', 'bullets'}:
                fail(errors, sp, '章節含未支援欄位')

    if errors:
        for error in errors:
            print('❌ ' + error)
        print(f'驗證未通過：{len(errors)} 個問題')
        return 1
    print(f'✅ 驗證通過：{len(notes)} 篇筆記，id 不重複，Schema 完整。')
    for category in sorted(CATEGORIES):
        print(f'   {category}: {sum(n["category"] == category for n in notes)} 篇')
    return 0


if __name__ == '__main__':
    sys.exit(validate())

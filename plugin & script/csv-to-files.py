import csv
import os
from datetime import datetime
import re


def sanitize_filename(title):
    """
    将标题转换为合法的文件名
    :param title: 原始标题
    :return: 处理后的文件名
    """
    # 转换为小写
    filename = title.lower()
    # 将空格转换为横线
    filename = filename.replace(' ', '-')
    # 将其他特殊字符转换为横线
    filename = re.sub(r'[^a-z0-9\-]', '-', filename)
    # 将多个连续的横线替换为单个横线
    filename = re.sub(r'-+', '-', filename)
    # 移除开头和结尾的横线
    filename = filename.strip('-')
    return filename


def create_mdx_file(row, output_dir):
    """
    根据CSV行数据创建MDX文件
    :param row: CSV的一行数据,包含title,cover,game等字段
    :param output_dir: 输出目录的根路径
    """
    # 根据分类路径创建目录结构
    category_dir = os.path.join(output_dir, row["cate"])
    os.makedirs(category_dir, exist_ok=True)

    # 生成文件名并构建完整路径
    filename = f"{sanitize_filename(row['title'])}.mdx"
    filepath = os.path.join(category_dir, filename)

    # 构建frontmatter(文件元数据)
    frontmatter = f"""---
title: {row['title']}
cover: {row['cover']}
game: {row['game']}
description: 
date: {datetime.now().strftime('%Y-%m-%d')}
---

"""

    # 处理游戏介绍内容
    content = row.get("content", "")
    if not content:
        # 如果没有提供内容,使用默认文本
        content = "游戏介绍即将到来..."

    # 组合完整的文件内容(标题 + 介绍)
    full_content = f"# {row['title']}\n\n{content}"

    # 将内容写入文件
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(frontmatter)
        f.write(full_content)


def convert_csv_to_mdx(csv_file, output_dir):
    """
    将CSV文件转换为多个MDX文件
    :param csv_file: 输入的CSV文件路径
    :param output_dir: 输出目录路径
    """
    # 确保输出根目录存在
    os.makedirs(output_dir, exist_ok=True)

    # 读取并处理CSV文件
    with open(csv_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        # 遍历每一行数据并生成对应的MDX文件
        for row in reader:
            create_mdx_file(row, output_dir)


if __name__ == "__main__":
    # 配置输入输出路径
    csv_file = "games.csv"        # CSV文件路径
    output_dir = "games"          # 输出目录路径
    # 执行转换
    convert_csv_to_mdx(csv_file, output_dir)

#!/usr/bin/env python3
"""has a function"""


def index_range(page, page_size):
    """returns a tuple"""
    return ((page-1) * page_size, page * page_size)

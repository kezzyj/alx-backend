"""has 1 class inheriting from another file """
from collections import deque


BaseCaching = __import__('base_caching').BaseCaching


class LIFOCache(BaseCaching):
    """fifo caching"""
    def __init__(self):
        """initialize"""
        super().__init__()
        self.q = deque([])

    def get(self, key):
        """returns value"""
        if key and key in self.cache_data.keys():
            return self.cache_data[key]
        return None

    def put(self, key, item):
        """assigns value"""
        if key and item:
            if len(self.q) >= BaseCaching.MAX_ITEMS:
                print(self.q)
                k = self.q.pop()
                del self.cache_data[k]
                print("DISCARD: {:s}".format(k))
                self.q.appendleft(key)
            else:
                self.q.append(key)
            self.cache_data[key] = item

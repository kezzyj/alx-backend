"""has 1 class inheriting from another file """
from collections import deque


BaseCaching = __import__('base_caching').BaseCaching


class FIFOCache(BaseCaching):
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
            exists = key in self.q
            self.cache_data[key] = item
            if exists:
                for i in range(len(self.q)):
                    if self.q[i] == key:
                        self.q.remove(key)
                        break
            self.q.append(key)
            while len(self.q) > BaseCaching.MAX_ITEMS:
                k = self.q.popleft()
                del self.cache_data[k]

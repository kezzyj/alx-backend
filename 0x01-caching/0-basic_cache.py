"""has 1 class inheriting from another file """
BaseCaching = __import__('base_caching').BaseCaching


class BasicCache(BaseCaching):
    """is a class"""
    def __init__(self) -> None:
        """initialises"""
        super().__init__()

    def put(self, key, item):
        """Adds a key to the dict"""
        if key and item:
            self.cache_data[key] = item

    def get(self, key):
        """returns a value of a key in a dict"""
        if not key or key not in self.cache_data.keys():
            return None
        return self.cache_data[key]

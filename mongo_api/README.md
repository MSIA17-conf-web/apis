# API MongoDB

Every request need at least the `mongoDB_options` object in their body which set which data base and which collection will be requested:

Required options :

- `mongoDB_options` : object
  - `col` : string
  - `db` : string

# POST /get

The GET route allow you to request an entire collection of a Mongo data base or only document from it.

Optional options :

- `filter` : object
  - `key` : string
  - `value` : string

## Get Example with filter

### Request

```json
{
  "mongoDB_options": {
    "col": "passports",
    "db": "passports",
    "filter": { "key": "model_Name", "value": "CESI_JPO" }
  }
}
```

### Response

```json
{
  "result": {
    "model_Name": "CESI_JPO",
    "room_List": [
      {
        "room_Name": "CUISINE",
        "esp_List": [
          {
            "esp_Hostname": "0D1EA79ECDD9"
          }
        ]
      },
      {
        "room_Name": "SALON",
        "esp_List": [
          {
            "esp_Hostname": "3C71BF9D1300"
          }
        ]
      },
      {
        "room_Name": "HALL",
        "esp_List": [
          {
            "esp_Hostname": "40F629D01B72"
          }
        ]
      }
    ]
  }
}
```

## Get Example Without filter

### Request

```json
{
  "mongoDB_options": {
    "col": "test",
    "db": "passports"
  }
}
```

### Response

```json
{
  "result": [
    {
      "object": {
        "name": "Willem"
      },
      "inserted": true
    },
    {
      "object": {
        "name": "andrea"
      },
      "inserted": true
    },
    {
      "object": {
        "name": "arnaud"
      },
      "inserted": false
    }
  ]
}
```

# POST /insert

The INSERT route will write new documents only if it doesn't already exist. (to modify document use the [MODIFY](#post-modify) route)

**Hint** : The `filter` object is to verify if an object exist and the `object` is the document to write if the filter isn't found in the collection.

Required Options :

- `objects` : array
  - `filter` : object
    - `key`: string (put the wanted key)
    - `value`: string (put the wanted value)
  - `object`: object - the document you want to insert

## Insert Example

### Request

```json
{
  "mongoDB_options": { "col": "test", "db": "passports" },
  "objects": [
    {
      "filter": { "name": "Willem" },
      "object": { "name": "Willem", "age": "24" }
    },
    {
      "filter": { "name": "andrea" },
      "object": { "name": "andrea", "age": "12" }
    },
    {
      "filter": { "name": "arnaud" },
      "object": { "name": "arnaud", "age": "27" }
    }
  ]
}
```

### Response

In the reponse, `inserted` will be set to false if the document hasn't been inserted, because it already exist (Like "arnaud" in the following exemple)

```json
{
  "result": [
    {
      "object": {
        "name": "Willem"
      },
      "inserted": true
    },
    {
      "object": {
        "name": "andrea"
      },
      "inserted": true
    },
    {
      "object": {
        "name": "arnaud"
      },
      "inserted": false
    }
  ]
}
```

# POST /modify

The modify route will modify an existing document and will do nothing if the document does not exist.

The body is the same as the one for [INSERT](#post-insert)

Required Options :

- `objects` : array
  - `filter` : object
    - `key`: string (put the wanted key)
    - `value`: string (put the wanted value)
  - `object`: object - the document you want to insert

## Modify Example :

### Request

```json
{
  "mongoDB_options": { "col": "test", "db": "passports" },
  "objects": [
    {
      "filter": { "name": "Willem" },
      "object": { "name": "Willem", "age": "24" }
    },
    {
      "filter": { "name": "andrea" },
      "object": { "name": "andrea", "age": "12" }
    },
    {
      "filter": { "name": "arnaud" },
      "object": { "name": "arnaud", "age": "27" }
    }
  ]
}
```

### Response

The `modified` key is set to false when the modification didn't occur a `msg` is aded to tell you why. (Like for `sarah` )

```json
{
  "result": [
    {
      "object": {
        "name": "Willem"
      },
      "modified": true
    }
    {
      "object": {
        "name": "sarrah"
      },
      "modified": false,
      "msg": "Not found"
    },
    {
      "object": {
        "name": "bertha"
      },
      "modified": true
    }
  ]
}
```

# POST /delete

The DELETE route will delete every document where the values exist for a given key.

Required options :

- `key`: string
- `values` : string array

## Delete Example

### Request

```json
{
  "mongoDB_options": { "col": "test", "db": "passports" },
  "key": "name",
  "values": ["andrea", "Willem"]
}
```

### Response

The `deleted` key is set to false when value hasn't been found

```json
{
  "result": [
    {
      "value": "andrea",
      "deleted": false
    },
    {
      "value": "Willem",
      "deleted": true
    }
  ]
}
```

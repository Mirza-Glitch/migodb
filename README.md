# Migodb 
[![npm version](https://img.shields.io/npm/v/migodb.svg)](https://www.npmjs.com/package/migodb) ![npm](https://img.shields.io/npm/dy/migodb) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Migodb is a lightweight file system-based database for Node.js, inspired by Mongoose. It provides an easy-to-use API for managing data using JSON files as the storage medium. Unlike traditional database systems, migodb operates synchronously, making it suitable for smaller projects and applications where simplicity and ease are prioritized.

## Installation

You can install migodb via npm:

```bash
npm install migodb
```

## Usage

### Importing

```javascript
// Import the default class
import { Database } from "migodb";

// Create a new instance of YourClass
const db = new Database("./data/db.json");

// Connect to database
db.connect();
```

### Inserting Data

```javascript
// Insert a single document
const data = { name: "John Doe", age: 28 };
const insertedData = db.insertOne(data);

// Insert multiple documents
const dataArray = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 28 },
];
const insertedDataArray = db.insertMany(dataArray);
```

### Querying Data

```javascript
// Find a single document
const query = { name: "John Doe" };
const result = db.findOne(query); // returns { name: 'John Doe', age: 28, _id: "12345669594828" }

// Find multiple documents
const queryMany = { age: 28 };
const resultMany = db.findMany(queryMany); // returns [{ name: 'John Doe', age: 28, _id: "12345669594828" }, { name: 'Bob', age: 28, _id: "37373828192837" }]

// Find a document by its ID
const documentId = "12345669594828";
const resultById = db.findById(documentId); // returns { name: 'John Doe', age: 28, _id: "12345669594828" }
```

### Updating Data

```javascript
// Update a single document
// You can pass multiple key value in query, like: { name: "John Doe", age: 29 }
const queryToUpdate = { name: "John Doe" };
const newData = { age: 29 };
const updatedDocument = db.findOneAndUpdate(queryToUpdate, newData); // returns { name: 'John Doe', age: 29, _id: "12345669594828" }

// Update multiple documents
const queryToUpdateMany = { age: 28 };
const newDataMany = { status: "active" };
const updatedDocuments = db.findManyAndUpdate(queryToUpdateMany, newDataMany); // returns [{ name: 'Bob', age: 28, status: "active", _id: "37373828192837" }]
```

### Replace Data

```javascript
// Update a single document
const queryToUpdate = { name: "John Doe" };
const newData = { age: 30 };
const updatedDocument = db.findOneAndReplace(queryToUpdate, newData); // returns { name: 'John Doe', age: 30, _id: "12345669594828" }

// Update multiple documents
const queryToUpdateMany = { age: 30 };
const newDataMany = { name: "John Doe", age: 29 };
const updatedDocuments = db.findManyAndReplace(queryToUpdateMany, newDataMany); // returns [{ name: 'John Doe', age: 29, status: "active", _id: "12345669594828" }]
```

### Deleting Data

```javascript
// Delete a single document
const queryToDelete = { name: "John Doe" };
const deletedDocument = db.findOneAndDelete(queryToDelete); // returns deleted from object data, example: { name: 'John Doe', age: 28, _id: "12345669594828" }

// Delete multiple documents
const queryToDeleteMany = { age: 28 };
const deletedDocuments = db.findManyAndDelete(queryToDeleteMany); // returns array of deleted data, example: [{ name: 'Bob', age: 28, status: "active", _id: "37373828192837" }]
```

### Other Operations

```javascript
// Count the number of documents in the database
const count = db.count();
console.log("Total documents:", count); // returns total length of available documents

// Check if data exists in db
const isExisting = db.exists({ name: "John Doe" });
console.log(isExisting); // returns true

// Check the file size of db
const fileSize = db.dbSize()
console.log(fileSize) // returns file size of database in bytes, example: "48 bytes"

```

## API Reference

### `Database`

The main class representing the file system database.

#### `constructor(path: string)`

Creates a new instance of the database with the given JSON file path.

- `path`: The path to the JSON file for data storage, example: `"./data/db.json"`.

#### `connect(): string`

Connects to the database and initializes the data.

#### `insert(data: object | object[]): object | object[] | null`

Inserts data into the database. Can accept a single object or an array of objects as parameter. Returns the inserted data or null if any error occurs.

#### `insertOne(data: object): object`

Accepts an object and then inserts it into the database. Returns inserted object.

#### `insertMany(array: object[]): object[]`

Accepts an array of objects and inserts it into the database. Returns inserted data.

#### `find(object: {} | object): object[]`

Accepts an empty or an object as parameter. Passing empty object will return all the data present in database as array of objects. Passing an object to find will return a filtered array of objects.

#### `findOne(query: object): object | null`

Accepts an object as parameter and returns a single document from the database based on the filter. Returns null if not found.

#### `findMany(query: object): object[]`

Accepts an object as parameter and returns a multiple document from the database based on the filter.

#### `findById(id: string): object | undefined`

Finds a document in the database by its ID.Accepts a string (a document's ID) as parameter and return the document based on ID, returns undefined of not found.

#### `findOneAndUpdate(query: object, newData: object): object | null`

Takes two parameters, one is filter object and second is new data object which you want to add or update key values. Updates a single document in the database based on the query and returns updated document or null if any error occurrs.

#### `findManyAndUpdate(query: object, newData: object): object[]`

Takes two parameters, same as findOneAndUpdate. Updates a multiple documents in the database based on the query and returns updated documents as an array of objects.

#### `updateOne(query: object, newData: object): boolean | null`

Same as findOneAndUpdate but instead of returning updated data it returns 1, returns 0 if any error occurrs.

#### `updateMany(query: object, newData: object): number`

Same as findManyAndUpdate but instead of returning array of updated data it returns the count of updated data, returns 0 if any error occurrs.

#### `findByIdAndUpdate(id: string, newData: object): object | null`

Finds a document by its ID and updates its data and returns updated document or null if any error occurrs.

#### `findOneAndReplace(query: object, newData: object): object | null`

Finds a document based on the query and replaces it with new data and returns replaced document or null if any error occurs. This method is not similar to update method. The update method can be used to add or edit existing values of a document, whereas replace method will replace the whole document with new data passed in the parameter.

#### `findManyAndReplace(query: object, newData: object): object[] | null`

Replaces multiple documents in the database based on the query and returns replaced documents as an array of objects or null if any error occurrs.

#### `replaceOne(query: object, newData: object): number`

Same as findOneAndReplace but instead of returning updated data it returns 1, returns 0 if any error occurrs.

#### `replaceMany(query: object, newData: object): number`

Same as findManyAndReplace but instead of returning array of updated data it returns the count of replaced data, returns 0 if any error occurrs.

#### `findByIdAndReplace(id: string, newData: object): object | null`

Finds a document by its ID and replaces it with new data object and returns replaced document or null if any error occurrs.

#### `findOneAndDelete(query: object): object | null`   

Finds a document based on the query and deletes it from the database and returns deleted document or null if any error occurs.

#### `findManyAndDelete(query: object): object[] | null`

Finds multiple documents based on the query and deletes them from the database and returns an array of deleted documents or null if any error occurrs.

#### `deleteOne(query: object): number`

Same as findOneAndDelete but instead of returning deleted data it returns 1, returns 0 if any error occurrs.

#### `deleteMany(query: object): number`

Same as findManyAndDelete but instead of returning array of deleted data it returns the count of deleted documents, returns 0 if any error occurrs.

#### `findByIdAndDelete(id: string, newData: object): object | null`

Finds a document by its ID and deletes it and returns deleted document or null if any error occurrs.

#### `count(): number`

Returns the total count of documents present in the database.

#### `dbSize(): string`

Returns the size of the database file in bytes.

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/Mirza-Glitch/migodb/blob/main/LICENSE) file for details.

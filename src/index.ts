import fs from "fs";
import { uid } from "uid";

interface DatabaseRecord {
  _id?: string;
  [key: string]: any;
}

type Filter = Record<string, any>;

export class Database {
  private path: string;
  private jsonData: Record<string, DatabaseRecord>;

  constructor(path: string) {
    this.path = path;
    this.jsonData = {};
  }

  public connect(): string {
    try {
      let data = fs.readFileSync(this.path, "utf-8");
      this.jsonData = JSON.parse(data);
      return `Connected to ${this.path} successfully!`;
    } catch (e) {
      try {
        let folder = this.path.split("/");
        let fileName = folder.pop();
        fs.mkdirSync(folder.join("/"), { recursive: true });
        fs.writeFileSync(this.path, JSON.stringify({}));
        return `Created ${this.path} successfully!`;
      } catch (err) {
        return JSON.stringify(err);
      }
    }
  }

  public insert(data: Filter | Filter[]) {
    if (Object.keys(data)) return this.insertOne(data) as DatabaseRecord;
    if (Array.isArray(data)) return this.insertMany(data) as DatabaseRecord[];
    return null;
  }

  public insertOne(object: Filter): DatabaseRecord {
    let newId: string = uid(16);
    object["_id"] = newId;
    this.jsonData[newId] = object;
    this.saveToFile();
    return object;
  }

  public insertMany(array: Filter[]): DatabaseRecord[] | null {
    if (Array.isArray(array)) {
      try {
        array.forEach((val, i) => {
          let newId: string = uid(16);
          Object.assign(val, { _id: newId });
          this.jsonData[newId] = val;
        });
        this.saveToFile();
        return array;
      } catch {
        return null;
      }
    }
    return null;
  }

  public find(object: {} | Filter): Array<DatabaseRecord> {
    if (Object.keys(object).length === 0) return this.myDataArray;
    return this.findMany(object);
  }

  public findOne(query: Filter) {
    return this.performFindOne(query, false) as DatabaseRecord | null;
  }

  public findMany(query: Filter) {
    return this.performFindMany(query, false) as Array<DatabaseRecord>;
  }

  public findById(id: string): Filter | undefined {
    return this.jsonData[id];
  }

  public findOneAndUpdate(
    query: Filter,
    newData: Filter
  ): DatabaseRecord | null {
    let index = this.performFindOne(query, true) as number;
    let objIndex: string | undefined = this.myDataArray[index]["_id"];
    if (!objIndex) return null;
    Object.assign(this.jsonData[objIndex], newData);
    this.saveToFile();
    return this.jsonData[objIndex];
  }

  public findManyAndUpdate(
    query: Filter,
    newData: Filter
  ): Array<DatabaseRecord> {
    let indexes = this.performFindMany(query, true) as Array<number>;
    let updatedObjs: Array<DatabaseRecord> = [];
    for (let i = 0; i < indexes.length; i++) {
      let index: number = indexes[i];
      let objIndex: string | undefined = this.myDataArray[index]["_id"];
      if (!objIndex) continue;
      Object.assign(this.jsonData[objIndex], newData);
      updatedObjs.push(this.jsonData[objIndex]);
    }
    this.saveToFile();
    return updatedObjs;
  }

  public updateOne(query: Filter, newData: Filter): number {
    if (this.findOneAndUpdate(query, newData)) return 1;
    return 0;
  }

  public updateMany(query: Filter, newData: Filter): number {
    let updatedObjs = this.findManyAndUpdate(query, newData);
    if (Array.isArray(updatedObjs)) return updatedObjs.length;
    return 0;
  }

  public findByIdAndUpdate(id: string, newData: Filter): DatabaseRecord | null {
    try {
      Object.assign(this.jsonData[id], newData);
      this.saveToFile();
      return this.jsonData[id];
    } catch {
      return null;
    }
  }

  public findOneAndReplace(
    query: Filter,
    newData: DatabaseRecord
  ): DatabaseRecord | null {
    let index = this.performFindOne(query, true) as number;
    try {
      let objIndex: string | undefined = this.myDataArray[index]["_id"];
      if (!objIndex) return null;
      Object.assign(newData, { _id: objIndex });
      this.jsonData[objIndex] = newData;
      this.saveToFile();
      return this.jsonData[objIndex];
    } catch {
      return null;
    }
  }

  public findManyAndReplace(
    query: Filter,
    newData: DatabaseRecord
  ): DatabaseRecord[] | null {
    let indexes = this.performFindMany(query, true) as Array<number>;
    let updatedObjs: DatabaseRecord[] = [];
    try {
      for (let i = 0; i < indexes.length; i++) {
        let index: number = indexes[i];
        let objIndex: string | undefined = this.myDataArray[index]["_id"];
        if (!objIndex) continue;
        Object.assign(newData, { _id: objIndex });
        this.jsonData[objIndex] = newData;
        updatedObjs.push(this.jsonData[objIndex]);
      }
      this.saveToFile();
      return updatedObjs;
    } catch {
      return null;
    }
  }

  public replaceOne(query: Filter, newData: DatabaseRecord): number {
    if (this.findOneAndUpdate(query, newData)) return 1;
    return 0;
  }

  public replaceMany(query: Filter, newData: DatabaseRecord): number {
    let replacedObjs = this.findManyAndUpdate(query, newData);
    if (Array.isArray(replacedObjs)) return replacedObjs.length;
    return 0;
  }

  public findByIdAndReplace(
    id: string,
    newData: DatabaseRecord
  ): DatabaseRecord | null {
    try {
      Object.assign(newData, { _id: id });
      Object.assign(this.jsonData[id], newData);
      this.saveToFile();
      return this.jsonData[id];
    } catch {
      return null;
    }
  }

  public findOneAndDelete(query: Filter): DatabaseRecord | null {
    try {
      let index = this.performFindOne(query, true) as number;
      let objIndex: string | undefined = this.myDataArray[index]["_id"];
      if (!objIndex) return null;
      let deletedObj = JSON.parse(JSON.stringify(this.jsonData[objIndex]));
      delete this.jsonData[objIndex];
      this.saveToFile();
      return deletedObj;
    } catch {
      return null;
    }
  }

  public findManyAndDelete(query: Filter): Array<DatabaseRecord> | null {
    try {
      const indexes = this.performFindMany(
        query,
        true
      ).reverse() as Array<number>;
      const deletedObjs: Array<DatabaseRecord> = [];
      for (let i = 0; i < indexes.length; i++) {
        const index: number = indexes[i];
        const objIndex: string | undefined = this.myDataArray[index]["_id"];
        if (!objIndex) continue;
        deletedObjs.push(JSON.parse(JSON.stringify(this.jsonData[objIndex])));
        delete this.jsonData[objIndex];
      }
      this.saveToFile();
      return deletedObjs;
    } catch {
      return null;
    }
  }

  public deleteOne(query: Filter): number {
    if (this.findOneAndDelete(query)) return 1;
    return 0;
  }

  public deleteMany(query: Filter): number {
    let deletedObjs = this.findManyAndDelete(query);
    if (Array.isArray(deletedObjs)) return deletedObjs.length;
    return 0;
  }

  public findByIdAndDelete(query: string): DatabaseRecord | null {
    try {
      let deletedObj = JSON.parse(JSON.stringify(this.jsonData[query]));
      delete this.jsonData[query];
      this.saveToFile();
      return deletedObj;
    } catch {
      return null;
    }
  }

  public exists(query: Filter): boolean {
    if (this.find(query).length >= 1) return true;
    return false;
  }

  public count(): number {
    return this.myDataArray.length;
  }

  public dbSize(): string {
    let stats = fs.statSync(this.path).size;
    return `${stats} bytes`;
  }

  private saveToFile(): boolean {
    try {
      fs.writeFileSync(
        this.path,
        JSON.stringify(this.jsonData, null, 2),
        "utf-8"
      );
      return true;
    } catch {
      return false;
    }
  }

  private get myDataArray(): DatabaseRecord[] {
    return Object.values(this.jsonData);
  }

  private performFindOne(
    query: Filter,
    getIndex: boolean
  ): DatabaseRecord | number | null {
    for (let i = 0; i < this.myDataArray.length; i++) {
      let found = true;
      const object = this.myDataArray[i];
      for (const key in query) {
        if (object[key] !== query[key]) {
          found = false;
          break;
        }
      }
      if (found) {
        return getIndex ? i : object;
      }
    }
    return null;
  }

  private performFindMany(
    query: Filter,
    getIndex: boolean
  ): Array<DatabaseRecord | number> {
    const matchingObjects = [];

    for (let i = 0; i < this.myDataArray.length; i++) {
      let found = true;
      const object = this.myDataArray[i];
      for (const key in query) {
        if (object[key] !== query[key]) {
          found = false;
          break;
        }
      }
      if (found) {
        matchingObjects.push(getIndex ? i : object);
      }
    }
    return matchingObjects;
  }
}

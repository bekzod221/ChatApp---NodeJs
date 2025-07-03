import fs from "fs/promises"
import path from "path"
export const readPath = (file) => {
    return fs.readFile(path.join(process.cwd(), 'db', file + ".json"), "utf-8")
}

export const writePath = (file, data) => {
    return fs.writeFile(path.join(process.cwd(), 'db', file +".json"), data)
}
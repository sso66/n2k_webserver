## Server bundle Node.js application as single executable file for linux, macos and windows platforms

- create an empty or locate existing project root directory

- create a **package.json** manifest file with **npm init** command

- install required Node.js package modules for property **dependencies** or **devDependencies**

- create **main.js** or use **Configuration.js** for the application services file

- add property **main** with value **main.js** or **Configuraton.js** to package.json

- create **bin.js** or use **server.js** for the system services file

- add property **bin** with value **bin.js** or **server.js** to package.json

- if necessary, add property **pkg** with the propety/value **assets** and property/value **scripts** to **package.json** file

- to compile, run **pkg** module from command-line interface with arguments: **pkg . --targets nodeRange-platform-arch**

- add property **bin** in scripts section of package.json to compile and generate for executable bundle

- transfer and run the executable file from command-line or graphical user interface

- **chmod** the executable terminmal on linux/macos platforms and run the executable

- refer to https://www.npmjs.com/package/pkg for documentation

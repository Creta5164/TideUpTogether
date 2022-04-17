# TideUp Together

<p align="center">
  <img alt="TideUp Together - It's dangerous to go alone! Take this." width="640" src="./og-image.png"/>
</p>

### [Download mod](https://github.com/Creta5164/TideUpTogether/releases)
### [Watch video](https://youtu.be/LxWGaGxT3QE)

Synchronous and asynchronous multiplayer mod for Gustav's game : [TideUp](https://store.steampowered.com/app/1890520).

> This project is not completely organized, please check the 'TODO' section below.  
Contributions are always welcome!

---

## How to install client mod

1. Get `TideUpTogether.zip` from the Releases page.
2. Overwrite the `www` folder in the folder with the same name where the game is installed.
3. Run the game and check if the connection status(`Online`, `Offline`) is displayed in the upper left corner.

## How to host the server

If you want to do it with people you know, here's how to self-host.

1. Get `TideUpTogetherServer.zip` from the Releases page.
2. Find the server program for each platform(win, mac, linux, etc.).
3. After configuring the server settings by opening `appsettings.json`, run the server in a terminal (cmd, etc.).

To connect to the server you want from the client, in the first line of `www/js/plugins/TideUpTogether.js`, change the part (inside of quotes) corresponding to the address to the IP or domain you want to connect to.

```
var Address = '127.0.0.1';
```

The default port is `14522`.

# Build

The client (`TideUpTogether.js`) is used immediately without going through the same process as bundling due to the environment of the RPG Maker MV, which is the basis of the game.

The .NET SDK (6.0 or later) is required to build the server.

After moving to the `TideUpTogetherServer` directory in the terminal, you can build it with the command below.

```
dotnet publish -c Release -r <RID> -p:PublishSingleFile=true
```
`<RID>` is [Runtime identifier](https://docs.microsoft.com/en-us/dotnet/core/rid-catalog).

The build output can be found in `bin/Release`.

### Windows
```
dotnet publish -c Release -r win-x64 -p:PublishSingleFile=true
```

### Linux
```
dotnet publish -c Release -r linux-x64 -p:PublishSingleFile=true
```

### MacOS
```
dotnet publish -c Release -r osx-x64 -p:PublishSingleFile=true
```

---

# TODO

Since this mod project was made by building ideas quickly, there are a lot of parts that are not optimized or unorganized in many ways.

- [ ] Support for other languages  
  This can be solved by creating a different language version of `TideUpTogether-strings.js`.  
  In this script, information related to text has been mainly organized.
  
- [ ] Optimize packet transmission and reception  
  Currently the server works by broadcasting what the client sends to the clients in the same map.  
  Since it operates on a per-frame basis, the more connected clients, the more the bottleneck is expected.
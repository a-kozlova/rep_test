# Simulation von Braitenberg-Vehikeln

<p align="center">
  Eine Simulation von Vehikel nach Valentin Braitenberg in 2D.
  <img src="assets/preview.PNG">
</p>

## Einleitung
Im Rahmen des Studienprojekts (Sommersester 2019) der Ruhr-Universität-Bochum, ist dieser Simulator entstanden. Es handelt sich hierbei um eine Simulation, welche an Valentin Braitenbergs Vehikel angelehnt ist.

## Benötigte Software
Das Projekt ist daraus ausgelegt im Browser zu laufen, bei der Entwicklungsumgebung handelt es sich um eine NodeJS Laufzeit-Umgebung. D.h. [`NodeJS`](https://nodejs.org/en/) samt `NPM` muss installiert sein. Weitere Software wird nicht benötigt, jedoch empfehlen wir [Visual Studio Code](https://code.visualstudio.com/) als Editor, dafür sind auch empfohlene Konfigurationen hinterlegt.

Weiterhin verwenden wir [Webpack](https://webpack.js.org/) als Build-Tool. Der gesamte Build-Prozess findet automatisch statt und wird in dem nächsten Abschnitt beschrieben. Für die Interessierten befinden sich im Projekt die Dateien `webpack/*`, in den die Konfigurationen stehen.

## Build erstellen
Um die Entwicklungs-Umgebung zu starten müssen zunächst alle NPM Pakete installiert sein, das wird mit dem Befehl `npm install` ausgeführt. Danach steht der Befehl `npm start` zur Verfügung, der die Umgebung auf `localhost:8080` startet und eine Liveaktualiserung mit sich bringt.

Möchte man einen Prodution Build erzeugen, so kann das mit `npm run build` machen.

Achtung! Der Build erzeugt alle nötigen Js- und Css-Dateien, jedoch müssen die Schriftarten aus `assets/webfonts` manuell mit in den Ordner abgelegt werden (Mit der vorhanden Ordner-Struktur).

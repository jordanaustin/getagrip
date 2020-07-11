import { customElement, property, LitElement, html, css } from "lit-element";
import godirect from "@vernier/godirect";

class Player {
  constructor({ name, sensor }) {
    this.sensor = sensor;
    this.name = name;
    this.maxValue = 0;
    this.currentValue = 0;
  }
}

function formatToPounds(nValue) {
  return nValue < 0 ? 0 : (nValue * 0.22481).toFixed(2);
}

@customElement("get-grip")
export class GetGrip extends LitElement {
  @property({ type: Array }) devices = [];
  @property({ type: Array }) players = [];
  @property({ type: Array }) winners = [];
  @property({ type: Boolean }) gameRunning = false;

  static get styles() {
    return css`
      :host([hidden]),
      *[hidden] {
        display: none !important;
      }

      :host {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
          "Segoe UI Symbol";
        color: white;
      }

      * {
        text-transform: uppercase;
        color: white;
      }

      p {
        font-size: 2rem;
      }

      button {
        border: 5px solid white;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 100px;
        padding: 1rem 2rem;
        outline: none;
        cursor: pointer;
        transition: all 0.3s ease-in-out;

        width: auto;
        height: max-content;
      }

      button:hover,
      button:active {
        box-shadow: inset 0 0px 0px 5px hsla(100, 80%, 100%, 50%);
      }

      h1 {
        font-family: "Anton", -apple-system, BlinkMacSystemFont, "Segoe UI",
          Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji",
          "Segoe UI Emoji", "Segoe UI Symbol";
        font-weight: bolder;
        font-size: min(23vw, 16rem);
        opacity: 0.8;
        line-height: 0;
        align-self: normal;
      }

      .wrapper {
        display: grid;
        height: 100vh;
        /* background-color: #2196f3;
        background: linear-gradient(315deg, #b4d2ea 0%, #2196f3 100%); */
        /* background: #ff65ef;
        background: linear-gradient(to bottom right, #ff65ef, #59e4ff); */
        background: #d81bff;
        background: linear-gradient(to top left, #d81bff, #59e4ff);
      }

      header,
      main,
      footer {
        display: flex;
        justify-content: center;
      }

      main {
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      .players-list {
        display: flex;
        width: 100%;
        justify-content: space-evenly;
        align-items: center;
      }

      .connect-device {
        width: 50vw;
        font-size: 3vw;
        animation: blinkingOpacity 2s infinite;
      }

      .start-game {
        font-size: 6vw;
        animation: blinkingOpacity 2s infinite;
      }

      @keyframes blinkingOpacity {
        0% {
          opacity: 1;
        }
        50% {
          opacity: 0.7;
        }
        100% {
          opacity: 1;
        }
      }
    `;
  }

  async connectDevice() {
    try {
      const device = await godirect.selectDevice();
      // device.enableDefaultSensors();
      const [sensor] = device.sensors;
      this.devices = [...this.devices, device];
      this.players = [
        ...this.players,
        new Player({ name: `player ${this.players.length + 1}`, sensor }),
      ];
    } catch (err) {
      if (err.ABORT_ERR !== 20) console.error(err);
    }
  }

  startGame() {
    if (this.gameRunning) {
      this.devices.forEach((device) => device.stop());
      this.gameRunning = false;
      clearTimeout(this.gameTimer);
    } else {
      this.gameRunning = true;
      this.players.forEach((player) => {
        player.sensor.on("value-changed", (sensor) => {
          player.currentValue = sensor.value;
          player.maxValue = Math.max(player.maxValue, sensor.value);
          this.requestUpdate();
        });
      });
      this.devices.forEach((device) => device.start());
      this.gameTimer = setTimeout(() => {
        this.players.forEach((player) => {
          player.sensor.unbind();
        });
        this.devices.forEach((device) => device.stop());
        this.gameRunning = false;
        this.showWinner();
      }, 5000);
    }
  }

  showWinner() {
    if (this.players.length > 1) {
      this.winners = this.players.sort((a, b) => b.maxValue - a.maxValue);
    }
  }

  render() {
    return html`
      <div class="wrapper">
        <header>
          <h1>Get a grip</h1>
        </header>
        <main>
          <div class="players-list">
            ${this.players.map(
              (player) => html`
                <div class="player">
                  <p>${player.name}</p>
                  <p>
                    current force:
                    ${this.gameRunning
                      ? `${formatToPounds(player.currentValue)} lbs`
                      : 0}
                  </p>
                  <p>max force: ${formatToPounds(player.maxValue)} lbs</p>
                </div>
              `
            )}
          </div>
          <h2 ?hidden="${!this.winners.length}">
            ${this.winners.length ? html`${this.winners[0].name} wins!` : ""}
          </h2>
          <button class="connect-device" @click="${this.connectDevice}">
            connect sensor to add player
          </button>
        </main>
        <footer>
          <button
            ?hidden="${!this.players.length}"
            class="start-game"
            @click="${this.startGame}"
          >
            ${this.gameRunning ? "end game" : "start game"}
          </button>
        </footer>
      </div>
    `;
  }
}

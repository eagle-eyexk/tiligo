# 🔐 TiliGo — Apple iOS Signing Assets

This folder holds **everything required to sign and publish TiliGo on the Apple App Store.**
Base44 builds & submits the native iOS binary from the same web codebase; the credentials below are supplied in **Base44 Dashboard → Publish → iOS** (or to Codemagic if you build via CI).

## App identity
| Field | Value |
|---|---|
| App name | TiliGo |
| Bundle ID | `com.tiligo.app` |
| App Store ID | `6740427580` |
| Primary language | Albanian (sq-AL) |
| Distribution | Kosovo 🇽🇰 |
| Primary category | Food & Drink |
| Sub category | Shopping |
| Company / D-U-N-S | TiliGo Delivery L.L.C. (ARBK 812426957) |
| Support URL | https://tili-go.com/about |
| Marketing URL | https://tili-go.com/ |
| Privacy policy URL | https://tili-go.com/about |

## Credentials to upload (place real secrets in Base44 env vars — never commit them)
| Secret | Description |
|---|---|
| `APPSTORE_CONNECT_KEY_ID` | App Store Connect API key ID |
| `APPSTORE_CONNECT_ISSUER_ID` | App Store Connect issuer ID |
| `APPSTORE_CONNECT_KEY_P8` | `.p8` private key contents |
| `IOS_CERTIFICATE_P12` | Distribution certificate as base64 `.p12` |
| `IOS_CERTIFICATE_PASSWORD` | Password for the `.p12` |
| `IOS_PROVISIONING_PROFILE` | App Store distribution provisioning profile (base64) |
| `IOS_APPLE_ID` | Apple Developer account email |
| `IOS_TEAM_ID` | Apple Developer Team ID |
| `APPSTORE_APP_PASSWORD` | App-specific password (App Store Connect API / altool) |

## How to publish
1. Generate a distribution certificate + provisioning profile in the Apple Developer portal for `com.tiligo.app`.
2. Create an **App Store Connect API key** (Admin access) → download the `.p8`.
3. Base64-encode each binary asset (`.p12`, `.mobileprovision`, `.p8`) and store them as **Base44 environment secrets** (never commit raw values).
4. In **Base44 Dashboard → Publish → iOS**, attach the signing credentials and press **Submit to App Store**.
5. The build uses the version already referenced by the Apple Smart App Banner in `index.html` (`app-id=6740427580`).

## App Store metadata (Albanian)
- **Subtitle:** Dërgesa e shpejtë në kosovë — brenda 30 min.
- **Description:** TiliGo është platforma #1 e dërgesave në Kosovë. Porosit ushqim, pije, farmaci dhe supermarket drejt në derën tendë. Gjurmo porosinë live dhe paguaj me para ose kartë.
- **Keywords:** porosi,ushqim,dërgesa,pica,burger,sushi,farmaci,supermarket,Vushtrri,Kosovë
- **Promotional text:** 🚀 Provo TiliGo falas — porosit tani, merr brenda 30 min!

## Screenshots required
Provide 6.7", 5.5", and iPad 12.9" screenshot sets — 1 mandatory each.
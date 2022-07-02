// @ts-check
import fs from "fs";

const cp = fs.copyFileSync;
const write = fs.writeFileSync;

export default async function run(
  /** @type {import('./adapter-types').AdapterConfig} */
  {
    renderFunctionFilePath,
    routePatterns,
    apiRoutePatterns,
    portsFilePath,
    htmlTemplate,
  }
) {
  console.log("Running adapter script");
  ensureDirSync("api");
  // ensureDirSync("api/server-render");

  // cp(renderFunctionFilePath, "./api/render/elm-pages-cli.js");
  cp(renderFunctionFilePath, "./api/_elm-pages-cli.js");
  // cp(portsFilePath, "./api/render/port-data-source.mjs");
  cp(portsFilePath, "./api/_port-data-source.mjs");

  // write("./api/render/index.js", rendererCode(true, htmlTemplate));
  write("./api/index.js", rendererCode(false, htmlTemplate));
  // TODO rename functions/render to functions/fallback-render
  // TODO prepend instead of writing file

  const apiServerRoutes = apiRoutePatterns.filter(isServerSide);

  // ensureValidRoutePatternsForVercel(apiServerRoutes);

  // TODO filter apiRoutePatterns on is server side
  // TODO need information on whether api route is odb or serverless
  const apiRouteRedirects = apiServerRoutes
    .map((apiRoute) => {
      if (apiRoute.kind === "prerender-with-fallback") {
        return `${apiPatternToRedirectPattern(
          apiRoute.pathPattern
        )} /.vercel/builders/render 200`;
      } else if (apiRoute.kind === "serverless") {
        return `${apiPatternToRedirectPattern(
          apiRoute.pathPattern
        )} /.vercel/functions/server-render 200`;
      } else {
        throw "Unhandled 2";
      }
    })
    .join("\n");

  const redirectsFile =
    routePatterns
      .filter(isServerSide)
      .map((route) => {
        if (route.kind === "prerender-with-fallback") {
          return `${route.pathPattern} /.vercel/builders/render 200
${route.pathPattern}/content.dat /.vercel/builders/render 200`;
        } else {
          return `${route.pathPattern} /.vercel/functions/server-render 200
${route.pathPattern}/content.dat /.vercel/functions/server-render 200`;
        }
      })
      .join("\n") +
    "\n" +
    apiRouteRedirects +
    "\n";

  write("dist/_redirects", redirectsFile);
}

function ensureValidRoutePatternsForVercel(apiRoutePatterns) {
  const invalidVercelRoutes = apiRoutePatterns.filter((apiRoute) =>
    apiRoute.pathPattern.some(({ kind }) => kind === "hybrid")
  );
  if (invaliVercelRoutes.length > 0) {
    throw (
      "Invalid Vercel routes!\n" +
      invalidVercelRoutes
        .map((value) => JSON.stringify(value, null, 2))
        .join(", ")
    );
  }
}

function isServerSide(route) {
  return (
    route.kind === "prerender-with-fallback" || route.kind === "serverless"
  );
}

/**
 * @param {boolean} isOnDemand
 * @param {string} htmlTemplate
 */
function rendererCode(isOnDemand, htmlTemplate) {
  return `const path = require("path");
const busboy = require("busboy");
const htmlTemplate = ${JSON.stringify(htmlTemplate)};


/**
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {any} context
 */
exports.handler = function(event, context) {
  const requestTime = new Date();
  console.log(JSON.stringify(event));
  global.staticHttpCache = {};

  const compiledElmPath = path.join(__dirname, "_elm-pages-cli.js");
  const compiledPortsFile = path.join(__dirname, "_port-data-source.mjs");
  const renderer = require("./_src/render");
  const preRenderHtml = require("./_src/pre-render-html");
  try {
    const basePath = "/";
    const mode = "build";
    const addWatcher = () => {};

    const renderResult = await renderer(
      compiledPortsFile,
      basePath,
      require(compiledElmPath),
      mode,
      event.path,
      await reqToJson(event, requestTime),
      addWatcher,
      false
    );
    console.log("@@@renderResult", JSON.stringify(renderResult, null, 2));

    const statusCode = renderResult.is404 ? 404 : renderResult.statusCode;

    if (renderResult.kind === "bytes") {
      return {
        body: Buffer.from(renderResult.contentDatPayload.buffer).toString("base64"),
        isBase64Encoded: true,
        headers: {
          "Content-Type": "application/octet-stream",
          "x-powered-by": "elm-pages",
          ...renderResult.headers,
        },
        statusCode,
      };
    } else if (renderResult.kind === "api-response") {
      const serverResponse = renderResult.body;
      return {
        body: serverResponse.body,
        multiValueHeaders: serverResponse.headers,
        statusCode: serverResponse.statusCode,
        isBase64Encoded: serverResponse.isBase64Encoded,
      };
    } else {
      console.log('@rendering', preRenderHtml.replaceTemplate(htmlTemplate, renderResult.htmlString))
      return {
        body: preRenderHtml.replaceTemplate(htmlTemplate, renderResult.htmlString),
        headers: {
          "Content-Type": "text/html",
          "x-powered-by": "elm-pages",
          ...renderResult.headers,
        },
        statusCode,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      body: \`<body><h1>Error</h1><pre>\${error.toString()}</pre></body>\`,
      statusCode: 500,
      headers: {
        "Content-Type": "text/html",
        "x-powered-by": "elm-pages",
      },
    };
  }
}

/**
 * @param {import('aws-lambda').APIGatewayProxyEvent} req
 * @param {Date} requestTime
 * @returns {Promise<{ method: string; hostname: string; query: Record<string, string | undefined>; headers: Record<string, string>; host: string; pathname: string; port: number | null; protocol: string; rawUrl: string; }>}
 */
function reqToJson(req, requestTime) {
  return new Promise((resolve, reject) => {
    if (
      req.httpMethod && req.httpMethod.toUpperCase() === "POST" &&
      req.headers["content-type"] &&
      req.headers["content-type"].includes("multipart/form-data") &&
      req.body
    ) {
      try {
        console.log('@@@1');
        const bb = busboy({
          headers: req.headers,
        });
        let fields = {};

        bb.on("file", (fieldname, file, info) => {
          console.log('@@@2');
          const { filename, encoding, mimeType } = info;

          file.on("data", (data) => {
            fields[fieldname] = {
              filename,
              mimeType,
              body: data.toString(),
            };
          });
        });

        bb.on("field", (fieldName, value) => {
          console.log("@@@field", fieldName, value);
          fields[fieldName] = value;
        });

        // TODO skip parsing JSON and form data body if busboy doesn't run
        bb.on("close", () => {
          console.log('@@@3');
          console.log("@@@close", fields);
          resolve(toJsonHelper(req, requestTime, fields));
        });
        console.log('@@@4');

        if (req.isBase64Encoded) {
          bb.write(Buffer.from(req.body, 'base64').toString('utf8'));
        } else {
          bb.write(req.body);
        }
      } catch (error) {
        console.error('@@@5', error);
        resolve(toJsonHelper(req, requestTime, null));
      }
    } else {
      console.log('@@@6');
      resolve(toJsonHelper(req, requestTime, null));
    }
  });
}

/**
 * @param {import('aws-lambda').APIGatewayProxyEvent} req
 * @param {Date} requestTime
 * @returns {{method: string; rawUrl: string; body: string?; headers: Record<string, string>; requestTime: number; multiPartFormData: unknown }}
 */
function toJsonHelper(req, requestTime, multiPartFormData) {
  return {
    method: req.httpMethod,
    headers: req.headers,
    rawUrl: req.rawUrl,
    body: req.body,
    requestTime: Math.round(requestTime.getTime()),
    multiPartFormData: multiPartFormData,
  };
}
`;
}

/**
 * @param {fs.PathLike} dirpath
 */
function ensureDirSync(dirpath) {
  try {
    fs.mkdirSync(dirpath, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
}

/** @typedef {{kind: 'dynamic'} | {kind: 'literal', value: string}} ApiSegment */

/**
 * @param {ApiSegment[]} pathPattern
 */
function apiPatternToRedirectPattern(pathPattern) {
  return (
    "/" +
    pathPattern
      .map((segment, index) => {
        switch (segment.kind) {
          case "literal": {
            return segment.value;
          }
          case "dynamic": {
            return `:dynamic${index}`;
          }
          default: {
            throw "Unhandled segment: " + JSON.stringify(segment);
          }
        }
      })
      .join("/")
  );
}

async function handleAssetLinks(target) {
  const payload = [{
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.example.vivid",
      "sha256_cert_fingerprints": [
        "DF:81:92:B6:E7:73:EC:2A:62:56:E0:11:FD:4D:71:EA:DA:76:C2:8D:B8:AD:4E:54:98:41:4F:AE:4E:62:90:B3"
      ]
    }
  }];

  if (target.res && typeof target.res.status === "function") {
    target.res.setHeader("Cache-Control", "no-store");
    target.res.setHeader("Content-Type", "application/json");
    return target.res.status(200).json(payload);
  }

  if (target.context) {
    target.context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
      body: payload
    };
    return target.context.res;
  }
}

module.exports = async function (context, req) {
  if (context && context.req) {
    return handleAssetLinks({ context, req: context.req });
  } else {
    // Local express-like
    return handleAssetLinks({ req: context, res: req });
  }
};
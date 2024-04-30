require("dotenv").config();
const express = require("express");
const { validate } = require("email-validator");
const { stringify } = require("querystring");
const fetch = require("cross-fetch");
const { base } = require("../../deta");

const { encode } = require("html-entities");

const router = express.Router();

router.post("/", async (req, res) => {
  //   try {
  let { key, email, password, captcha } = req.body;

  if (!key || !email || !captcha)
    return res.status(400).json({
      message: "couldn't send email, incomplete request body",
    });

  if (!validate(email))
    return res.status(422).json({
      message: "couldn't send email, invalid email entered",
    });

  let { success } = await (
    await fetch(
      `https://www.google.com/recaptcha/api/siteverify?${stringify({
        secret: "6Ldt17ApAAAAAJ0lHicHFqy_uNqkJTUDCSvQG1wo",
        response: captcha,
      })}`
    )
  ).json();

  if (!success) {
    return res.status(422).json({
      message: "couldn't send email, invalid captcha",
    });
  }

  let pulpData = await base.get(key);

  if (!pulpData)
    return res.status(404).json({
      message: "couldn't send email, pulp not found",
    });

  if (pulpData.password) {
    if (!password)
      return res.status(401).json({
        message: "couldn't send email, pulp is protected",
      });

    if (pulpData.password != password)
      return res.status(401).json({
        message: "couldn't send email, password entered is wrong",
      });
  }

  // all checks are valid, send email to user

  console.log(encode(pulpData.content));

  let response = await fetch(`https://mail.dedomil.workers.dev/api/email`, {
    method: "POST",
    body: JSON.stringify({
      to: email,
      from: {
        email: "pulp@yadav.id",
        name: "pulp - share code",
      },
      subject: `pulp/${key} - someone shared a pulp with you`,
      html: `<pre><code>${encode(
        pulpData.content
      )}</code></pre><a href="https://pulpx.vercel.app/${key}">view</a> | <a href="https://pulp.deta.eu.org/pulp/${key}?type=raw">raw</a> | <a href="https://pulp.deta.eu.org/pulp/${key}?type=download">download</a>`,
    }),
    headers: {
      Authorization: "adityadv",
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    return res.status(200).json({
      message: "email sent successfully",
    });
  } else {
    return res.status(500).json({
      message: "couldn't send email, server error",
    });
  }
  //   } catch (error) {
  //     res.status(500).json({ message: "internal server error" });
  //   }
});

module.exports = router;

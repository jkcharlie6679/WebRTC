import express from "express";
import path from "path";
const __dirname = path.resolve();

let router = (app) => {
  app.use(express.static(__dirname + "/templates"));
};

export default router;


import express from "express";
import path from "path";
const __dirname = path.resolve();

export let route = (app) => {
  app.use(express.static(__dirname + "/templates"));
};

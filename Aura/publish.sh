#!/bin/sh
rm index.zip 
cd Alexa 
zip -r ../index.zip *
cd .. 
aws lambda update-function-code --function-name RoofTopLambda --zip-file fileb://index.zip

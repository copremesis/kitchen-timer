export BUCKET='dragonwrench'
aws s3 cp  --recursive --exclude "*.swp" js  s3://$BUCKET/kitchen-timer/js
aws s3 cp  --recursive --exclude "*.swp" css s3://$BUCKET/kitchen-timer/css
aws s3 cp  index.html                        s3://$BUCKET/kitchen-timer/index.html

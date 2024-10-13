import React from 'react';
import { makeStyles } from '@material-ui/core';
import { DsStyles } from './DsStyles';

const useStyles = makeStyles(DsStyles);
const DsIcon = () => {
  const classes = useStyles();
  return (
    <svg
      className={classes.svg}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={45.906}
      height={37.025}
      viewBox="0 0 12.146 9.796"
    >
      <defs>
        <linearGradient id="a">
          <stop
            className={classes.gradient}
            offset={0}
            style={{
              stopOpacity: 1,
            }}
          />
          <stop
            offset={1}
            style={{
              stopOpacity: 0,
            }}
          />
        </linearGradient>
        <linearGradient
          xlinkHref="#a"
          id="b"
          x1={77.372}
          x2={77.369}
          y1={100.611}
          y2={101.387}
          gradientTransform="translate(6.243 .924)"
          gradientUnits="userSpaceOnUse"
        />
        <linearGradient
          xlinkHref="#a"
          id="c"
          x1={77.372}
          x2={77.369}
          y1={100.611}
          y2={101.387}
          gradientTransform="translate(11.096 .924)"
          gradientUnits="userSpaceOnUse"
        />
        <linearGradient
          xlinkHref="#a"
          id="d"
          x1={77.372}
          x2={77.369}
          y1={100.611}
          y2={101.387}
          gradientTransform="translate(-.07 .924)"
          gradientUnits="userSpaceOnUse"
        />
      </defs>
      <text
        className={classes.text}
        xmlSpace="preserve"
        x={75.555}
        y={103.634}
        style={{
          fontStyle: 'italic',
          fontVariant: 'normal',
          fontWeight: 700,
          fontStretch: 'normal',
          fontSize: '11.1881px',
          lineHeight: 1.25,
          fontFamily: 'P052',
          fontVariantLigatures: 'normal',
          fontVariantCaps: 'normal',
          fontVariantNumeric: 'normal',
          fontVariantEastAsian: 'normal',
          fillOpacity: 1,
          stroke: 'none',
          strokeWidth: 0.279701,
        }}
        transform="matrix(1.02581 0 0 .97484 -76.855 -93.108)"
      >
        <tspan
          x={75.555}
          y={103.634}
          style={{
            strokeWidth: 0.279701,
          }}
        >
          ds {/* that's me :) */}
        </tspan>
      </text>
      <path
        className={classes.path}
        d="M77.216 101.385h11.302"
        style={{
          fill: 'none',
          strokeWidth: '.264583px',
          strokeLinecap: 'butt',
          strokeLinejoin: 'miter',
          strokeOpacity: 1,
        }}
        transform="translate(-76.855 -93.108)"
      />
      <path
        className={classes.path}
        d="m84.017 99.466-.72 3.411"
        style={{
          fill: 'none',
          stroke: 'url(#b)',
          strokeWidth: '.264583px',
          strokeLinecap: 'butt',
          strokeLinejoin: 'miter',
          strokeOpacity: 1,
        }}
        transform="translate(-76.855 -93.108)"
      />
      <path
        className={classes.path}
        d="m88.871 99.466-.72 3.411"
        style={{
          fill: 'none',
          stroke: 'url(#c)',
          strokeWidth: '.264583px',
          strokeLinecap: 'butt',
          strokeLinejoin: 'miter',
          strokeOpacity: 1,
        }}
        transform="translate(-76.855 -93.108)"
      />
      <path
        className={classes.path}
        d="m77.704 99.466-.72 3.411"
        style={{
          fill: 'none',
          stroke: 'url(#d)',
          strokeWidth: '.264583px',
          strokeLinecap: 'butt',
          strokeLinejoin: 'miter',
          strokeOpacity: 1,
        }}
        transform="translate(-76.855 -93.108)"
      />
    </svg>
  );
};

export default DsIcon;

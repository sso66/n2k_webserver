// File: ProductCodes.js
// Note: Purpose of Encoding/decoding for Producing NMEA Certified Products 
// Date: 04/15/2020
//..............................................................................
console.log( 'Mounting ProductCodes.js...' );

const ProductCodeEnum = {

        // Maretron Product Codes
        ACM100              : 26493,
        ALM100              : 8165,
        CLM100              : 2606,
        DCM100              : 9375,
        DCR100              : 22585,
        DSM150              : 20298,
        DSM250              : 16434,
        DST100              : 3563,
        DST110              : 1534,
        EMS100              : 9845,
        FFM100              : 3637,
        FPM100              : 21703,
        GPS100              : 1776,
        GPS200              : 3373,
        IPG100              : 9339,
        J2K100              : 4319,
        MBB200C             : 1151,
        MBB300C             : 27244,
        NBE100              : 3979,
        RAA100              : 4018,
        RIM100              : 4078,
        SIM100              : 23603,
        SMS100              : 1047,
        SSC200              : 434,
        TLA100              : 2781,
        TLM100              : 20067,
        TLM150              : 19391,
        TLM200              : 12140,
        TMP100              : 20067,
        TSM800C             : 22362,
        TSM810C             : 11322,
        TSM1330C            : 756,
        USB100              : 945,
        VDR100              : 29769,
        WSO100              : 5973,

        // Carling Product Codes
        AC08_Gen1           : 26423,
        AC08_Gen2           : 9627,
        AC08_Octolite       : 16942,
        AC13_Gen2           : 10688,
        AC16_Gen1           : 12283,
        AC08_1Can_Gen2      : 16942,
        AC19_Gen2           : 5766,
        ACM_Gen2            : 20891,

        DC08_Gen1           : 6954,
        DC08_Gen2           : 19971,
        DC12_Octolite       : 11482,
        DC16_Gen1           : 1425,
        DC16_Gen2           : 23359,
        DC16_Octolite       : 16736,
        DCM_Gen2            : 747,

        NPS_Gen1            : 16114,
        NPS_110V_Gen2       : 20570,
        NPS_220V_Gen2       : 16324,

        SIU_Gen1            : 2960,
        SIU_Gen2            : 29271,

        // MPower Product Codes
        /** MPower 12 output DC Controller with Deutsch Connectors @default 5693 */
        CLMD12              : 5693,
        /** MPower 12 output DC Controller with Molex Connectors @default 14147 */
        CLMM12              : 14147,
        /** MPower Keypad @default 26400 */
        CKM12               : 26400,
        /** MPower Switch Module @default 26400 */
        VMM6                : 19139
    };

/*****************************************************************************************
 * Array of Product Codes that identify Carling AC or DC switches.
 *****************************************************************************************/
const CARLING_SWITCHES = [
    ProductCodeEnum.AC08_Gen1,
    ProductCodeEnum.AC08_Gen2,
    ProductCodeEnum.AC08_Octolite,
    ProductCodeEnum.AC13_Gen2,
    ProductCodeEnum.AC16_Gen1,
    ProductCodeEnum.AC19_Gen2,
    ProductCodeEnum.DC08_Gen1,
    ProductCodeEnum.DC08_Gen2,
    ProductCodeEnum.DC12_Octolite,
    ProductCodeEnum.DC16_Gen1,
    ProductCodeEnum.DC16_Gen2,
    ProductCodeEnum.DC16_Octolite,
    ProductCodeEnum.CLMD12,
    ProductCodeEnum.CLMM12,
];

/*****************************************************************************************
 * Array of Product Codes that identify Carling AC switches.
 *****************************************************************************************/
const CARLING_AC_SWITCHES = [
    ProductCodeEnum.AC08_Gen1,
    ProductCodeEnum.AC08_Gen2,
    ProductCodeEnum.AC13_Gen2,
    ProductCodeEnum.AC08_Octolite,
    ProductCodeEnum.AC16_Gen1,
    ProductCodeEnum.AC19_Gen2,
];
        
/*****************************************************************************************
 * Array of Product Codes that identify Carling 2nd Generation AC Switches.
 *****************************************************************************************/
const CARLING_GEN2_AC_SWITCHES = [
    ProductCodeEnum.AC08_Gen2,
    ProductCodeEnum.AC13_Gen2,
    ProductCodeEnum.AC19_Gen2 
];

/*****************************************************************************************
 * Array of Product Codes that identify Carling DC switches.
 *****************************************************************************************/
const CARLING_DC_SWITCHES = [
    ProductCodeEnum.DC08_Gen1,
    ProductCodeEnum.DC08_Gen2,
    ProductCodeEnum.DC12_Octolite,
    ProductCodeEnum.DC16_Gen1,
    ProductCodeEnum.DC16_Gen2,
    ProductCodeEnum.DC16_Octolite,
    ProductCodeEnum.CLMD12,
    ProductCodeEnum.CLMM12,
];
        
/*****************************************************************************************
 * Array of Product Codes that identify Carling 2nd Generation DC Switches.
 *****************************************************************************************/
const CARLING_GEN2_DC_SWITCHES = [
    ProductCodeEnum.DC08_Gen2,
    ProductCodeEnum.DC16_Gen2,
    ProductCodeEnum.DC12_Octolite,
    ProductCodeEnum.DC16_Octolite,
    ProductCodeEnum.CLMD12,
    ProductCodeEnum.CLMM12,
];
        
module.exports = { ProductCodeEnum, 
                   CARLING_SWITCHES,
                   CARLING_AC_SWITCHES,
                   CARLING_GEN2_AC_SWITCHES, 
                   CARLING_DC_SWITCHES,
                   CARLING_GEN2_DC_SWITCHES                   
                 };

// eof
                 
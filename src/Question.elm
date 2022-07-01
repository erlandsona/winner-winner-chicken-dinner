module Question exposing (Index, indexDecoder)

-- import Json.Encode as Encode
-- import Json.Encode.Extra as EncodeX

import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Extra as DecodeX
import Time


type alias Index =
    { id : String
    , createdAt : Time.Posix
    , endsAt : Maybe Time.Posix
    , question : String

    -- , options : IndexOptions
    }



-- type alias IndexOptions =
--     {}


indexDecoder : Decoder Index
indexDecoder =
    Decode.succeed Index
        |> DecodeX.andMap (Decode.field "id" Decode.string)
        |> DecodeX.andMap (Decode.field "createdAt" DecodeX.datetime)
        |> DecodeX.andMap (Decode.field "endsAt" (Decode.nullable DecodeX.datetime))
        -- |> DecodeX.andMap (Decode.field "options" indexOptionsDecoder)
        -- |> DecodeX.andMap (Decode.field "ownerToken" Json.Decode.string)
        |> DecodeX.andMap (Decode.field "question" Decode.string)



-- indexOptionsDecoder : Decoder IndexOptions
-- indexOptionsDecoder =
--     Decode.succeed IndexOptions
-- encodedIndex : Index -> Encode.Value
-- encodedIndex index =
--     Encode.object
--         [ ( "createdAt", Encode.int (Time.posixToMillis index.createdAt) )
--         , ( "endsAt", EncodeX.maybe (Time.posixToMillis >> Encode.int) index.endsAt )
--         , ( "id", Encode.string index.id )
--         -- , ( "options", encodedIndexOptions index.options )
--         -- , ( "ownerToken", Encode.string index.ownerToken )
--         , ( "question", Encode.string index.question )
--         ]

module Route.Index exposing (ActionData, Data, Model, Msg, route)

import Api.Object.Poll
import Api.Query
import DataSource exposing (DataSource)
import DataSource.Port as Port
import Dict
import Effect exposing (Effect)
import ErrorPage exposing (ErrorPage)
import Form.Value
import Graphql.Operation exposing (RootQuery)
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet)
import Head
import Head.Seo as Seo
import Html
import Html.Attributes as A
import Json.Decode as Decode
import Json.Encode as Encode
import Pages.Field as Field
import Pages.FieldRenderer as FieldView
import Pages.Form as Form exposing (Form, HtmlForm)
import Pages.Msg
import Pages.PageUrl exposing (PageUrl)
import Pages.Url
import Path exposing (Path)
import Request.Hasura as DB
import Route
import RouteBuilder exposing (StatefulRoute, StaticPayload)
import Server.Request as Request
import Server.Response as Response exposing (Response)
import Shared
import Validation exposing (Validation)
import View exposing (View)


type alias Model =
    {}


type Msg
    = NoOp


type alias RouteParams =
    {}


route : StatefulRoute RouteParams Data ActionData Model Msg
route =
    RouteBuilder.serverRender
        { head = head
        , data = data
        , action = action
        }
        |> RouteBuilder.buildWithLocalState
            { view = view
            , update = update
            , subscriptions = subscriptions
            , init = init
            }


init :
    Maybe PageUrl
    -> Shared.Model
    -> StaticPayload Data ActionData RouteParams
    -> ( Model, Effect Msg )
init maybePageUrl sharedModel static =
    ( {}, Effect.none )


update :
    PageUrl
    -> Shared.Model
    -> StaticPayload Data ActionData RouteParams
    -> Msg
    -> Model
    -> ( Model, Effect Msg )
update pageUrl sharedModel static msg model =
    case msg of
        NoOp ->
            ( model, Effect.none )


subscriptions : Maybe PageUrl -> RouteParams -> Path -> Shared.Model -> Model -> Sub Msg
subscriptions maybePageUrl routeParams path sharedModel model =
    Sub.none


type alias Data =
    { polls : List Poll }


type alias ActionData =
    {}


type alias Poll =
    { id : Int
    , question : String
    }


data : RouteParams -> Request.Parser (DataSource (Response Data ErrorPage))
data routeParams =
    Request.requestTime
        |> Request.map
            (\time ->
                DB.dataSource time (Api.Query.poll identity (SelectionSet.map2 Poll Api.Object.Poll.id Api.Object.Poll.question))
                    |> DataSource.map (Data >> Response.render)
            )


action : RouteParams -> Request.Parser (DataSource (Response ActionData ErrorPage))
action routeParams =
    Request.skip "No action."


head : StaticPayload Data ActionData RouteParams -> List Head.Tag
head static =
    Seo.summary
        { canonicalUrlOverride = Nothing
        , siteName = "elm-pages"
        , image =
            { url = Pages.Url.external "TODO"
            , alt = "elm-pages logo"
            , dimensions = Nothing
            , mimeType = Nothing
            }
        , description = "TODO"
        , locale = Nothing
        , title = "TODO title" -- metadata.title -- TODO
        }
        |> Seo.website


view :
    Maybe PageUrl
    -> Shared.Model
    -> Model
    -> StaticPayload Data ActionData RouteParams
    -> View (Pages.Msg.Msg Msg)
view maybeUrl sharedModel model static =
    { title = "🍗"
    , body =
        [ Html.ul []
            (List.map
                (\p -> Route.Poll__Id___Edit { id = String.fromInt p.id } |> Route.link [] [ Html.text p.question ])
                static.data.polls
            )
        ]
    }

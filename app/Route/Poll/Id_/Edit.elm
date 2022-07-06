module Route.Poll.Id_.Edit exposing (ActionData, Data, Model, Msg, route)

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
import RouteBuilder exposing (StatefulRoute, StatelessRoute, StaticPayload)
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
    { id : String }


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


pages : DataSource (List RouteParams)
pages =
    DataSource.succeed []


type alias Data =
    { question : String }


type alias ActionData =
    {}



-- data : RouteParams -> Request.Parser (DataSource (Response Data ErrorPage))
-- data routeParams =
--     Request.succeed (DataSource.succeed (Response.render Data))


data : RouteParams -> Request.Parser (DataSource (Response Data ErrorPage))
data routeParams =
    Request.requestTime
        |> Request.map
            (\time ->
                let
                    void : a -> b
                    void a =
                        void a
                in
                DB.dataSource time
                    (Api.Query.poll_by_pk
                        { id =
                            case String.toInt routeParams.id of
                                Just id ->
                                    id

                                Nothing ->
                                    void "Not Found"
                        }
                        Api.Object.Poll.question
                        |> SelectionSet.nonNullOrFail
                    )
                    |> DataSource.map (Data >> Response.render)
            )


action : RouteParams -> Request.Parser (DataSource (Response ActionData ErrorPage))
action routeParams =
    Request.skip "No action."


head :
    StaticPayload Data ActionData RouteParams
    -> List Head.Tag
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


type alias PollInput =
    { question : String }


form : HtmlForm String PollInput String msg
form =
    let
        toPollInput : Form.ParsedField String String -> Validation String PollInput
        toPollInput question =
            Validation.succeed PollInput
                |> Validation.withField question
    in
    Form.init
        toPollInput
        (\formState question ->
            ( []
            , [ FieldView.input [] question
              , Html.text
                    (formState.errors
                        |> Dict.get question.name
                        |> Maybe.withDefault []
                        |> String.concat
                    )
              , Html.button [] [ Html.text "Goooo!!!!" ]
              ]
            )
        )
        |> Form.field "question"
            (Field.text
                |> Field.required "Need a Question to make a Poll!"
                |> Field.withInitialValue Form.Value.string
            )


view :
    Maybe PageUrl
    -> Shared.Model
    -> Model
    -> StaticPayload Data ActionData RouteParams
    -> View (Pages.Msg.Msg Msg)
view maybeUrl sharedModel model app =
    { title = "Edit Poll"
    , body =
        [ Form.renderHtml
            { method = Form.Post
            , submitStrategy = Form.TransitionStrategy
            }
            app
            app.data.question
            form
        ]
    }
